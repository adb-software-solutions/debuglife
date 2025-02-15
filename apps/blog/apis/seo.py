from ninja import Router
import spacy
import re
import math 
from apps.blog.schemas.seo import PassivTextCheckInput, PassiveTextCheckOutput, ReadabilityAssessment, SEOAssessment, KeyphraseDistributionCheckOutput, KeyphraseDistributionCheckInput, SentimentCheckInput, LexicalDiversityCheckInput, SentimentCheckOutput, LexicalDiversityCheckOutput
from apps.blog.utils.seo import contains_keyphrase_variation
from spacytextblob.spacytextblob import SpacyTextBlob

# Load spaCy model
nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("spacytextblob")

def clean_text(text: str) -> str:
    """
    Clean Markdown text by removing:
    - Code blocks (``` ... ```)
    - Inline code (`...`)
    - Image markdown (![alt](url))
    - Headings (lines starting with '#' characters)
    """
    # Remove code blocks.
    text = re.sub(r"```[\s\S]*?```", "", text)
    # Remove inline code.
    text = re.sub(r"`[^`]*`", "", text)
    # Remove image markdown.
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    # Remove headings.
    text = "\n".join(line for line in text.split("\n") if not re.match(r"^#{1,6}\s", line))
    return text

seo_nlp_router = Router(tags=["SEO NLP"])

@seo_nlp_router.post("/seo/analyze-passive-text", response=PassiveTextCheckOutput)
def analyze_passive_text(request, payload: PassivTextCheckInput):
    # Clean the content before analysis.
    text = clean_text(payload.content)
    doc = nlp(text)
    sentences = list(doc.sents)
    total_sentences = len(sentences)
    
    # Count the number of sentences that contain a passive subject.
    passive_count = sum(
        1 for sent in sentences if any(token.dep_ == "nsubjpass" for token in sent)
    )
    
    # Compute the ratio (for internal thresholding only)
    ratio = passive_count / total_sentences if total_sentences > 0 else 1

    # Apply new thresholds:
    # Under 10%: green, 10-15%: amber, 15%+: red.
    if ratio <= 0.10:
        score = 9
        feedback = "Very little passive voice detected."
    elif ratio <= 0.15:
        score = 3
        feedback = f"Some passive voice detected ({(ratio * 100):.2f}%); consider using more active constructions."
    else:
        score = 0
        feedback = f"Excessive passive voice detected ({(ratio * 100):.2f}%); consider revising."
    
    passive_assessment = ReadabilityAssessment(
        score=score,
        max=9,
        feedback=feedback
    )
    
    return PassiveTextCheckOutput(passive_assessment=passive_assessment)

@seo_nlp_router.post("/seo/analyze-keyphrase-distribution", response=KeyphraseDistributionCheckOutput)
def analyze_keyphrase_distribution(request, payload: KeyphraseDistributionCheckInput):
    # Clean the content.
    text = clean_text(payload.content)
    lower_text = text.lower()
    words = lower_text.split()
    total_words = len(words)
    
    fixed_segment_size = 300
    num_segments = max(3, math.ceil(total_words / fixed_segment_size))
    segment_size = math.ceil(total_words / num_segments)
    
    segments = []
    for i in range(num_segments):
        start = i * segment_size
        end = start + segment_size
        segment = " ".join(words[start:end])
        segments.append(segment)
    
    # Count segments that contain the keyphrase variation
    segments_with_keyphrase = sum(
        1 for seg in segments if contains_keyphrase_variation(seg, payload.keyphrase, nlp)
    )

    # Determine score and feedback based on segments with keyphrase.
    if segments_with_keyphrase == num_segments:
        score = 9
        feedback = "Keyphrase is well distributed throughout the content."
    elif segments_with_keyphrase == num_segments - 1:
        score = 3
        feedback = "Keyphrase appears in most segments; consider distributing it more evenly."
    else:
        score = 0
        feedback = "Keyphrase is not evenly distributed; it appears too concentrated in certain areas."

    distribution_assessment = SEOAssessment(
        score=score,
        max=9,
        feedback=feedback
    )
    
    return KeyphraseDistributionCheckOutput(keyphrase_assessment=distribution_assessment)

@seo_nlp_router.post("/seo/analyze-sentiment", response=SentimentCheckOutput)
def analyze_sentiment(request, payload: SentimentCheckInput):
    text = clean_text(payload.content)
    doc = nlp(text)
    polarity = doc._.blob.polarity
    subjectivity = doc._.blob.subjectivity

    # Define thresholds for "ideal" sentiment:
    # Score 9: Polarity between 0 and 0.1 (neutral to slightly positive) and subjectivity ≤ 0.5.
    # Score 3: Polarity between -0.2 and 0.2 and subjectivity ≤ 0.7.
    # Score 0: Otherwise (too extreme or highly subjective).
    if 0 <= polarity <= 0.1 and subjectivity <= 0.5:
        score = 9
        feedback = "Content sentiment is balanced and objective."
    elif -0.2 < polarity < 0.2 and subjectivity <= 0.7:
        score = 3
        feedback = (
            f"Content sentiment is acceptable (polarity: {polarity:.2f}, "
            f"subjectivity: {subjectivity:.2f}); consider minor adjustments."
        )
    else:
        score = 0
        feedback = (
            f"Content sentiment is too extreme (polarity: {polarity:.2f}, "
            f"subjectivity: {subjectivity:.2f}); consider revising the tone."
        )

    sentiment_assessment = ReadabilityAssessment(score=score, max=9, feedback=feedback)

    return SentimentCheckOutput(sentiment_assessment=sentiment_assessment)

@seo_nlp_router.post("/seo/analyze-lexical-diversity", response=LexicalDiversityCheckOutput)
def analyze_lexical_diversity(request, payload: LexicalDiversityCheckInput):
    text = clean_text(payload.content)
    doc = nlp(text)
    # Filter for alphabetic tokens in lowercase
    tokens = [token.text.lower() for token in doc if token.is_alpha]
    if tokens:
        ratio = len(set(tokens)) / len(tokens)
    else:
        ratio = 0.0

    # Apply thresholds:
    # High lexical diversity (>= 0.6): score 9
    # Moderate diversity (>= 0.4 but < 0.6): score 3
    # Low diversity (< 0.4): score 0
    if ratio >= 0.6:
        score = 9
        feedback = "High lexical diversity; content uses a rich and varied vocabulary."
    elif ratio >= 0.4:
        score = 3
        feedback = "Moderate lexical diversity; consider using a more varied vocabulary for richer content."
    else:
        score = 0
        feedback = "Low lexical diversity; content appears overly repetitive."

    lexical_diversity_assessment = ReadabilityAssessment(
        score=score,
        max=9,
        feedback=feedback
    )

    return LexicalDiversityCheckOutput(lexical_diversity_assessment=lexical_diversity_assessment)
