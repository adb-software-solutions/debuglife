from ninja import Router
from apps.blog.schemas.seo import SEOAnalyzeInput, SEOAnalyzeOutput
import spacy

nlp = spacy.load("en_core_web_sm")

seo_nlp_router = Router(tags=["SEO NLP"])

@seo_nlp_router.post("/seo/analyze", response=SEOAnalyzeOutput)
def analyze_seo(request, payload: SEOAnalyzeInput):
    text = payload.content
    doc = nlp(text)
    sentences = list(doc.sents)
    total_sentences = len(sentences)
    passive_count = 0
    # Use spaCy to count passive sentences.
    for sent in sentences:
        for token in sent:
            if token.dep_ == "nsubjpass":
                passive_count += 1
                break
    passive_ratio = passive_count / total_sentences if total_sentences > 0 else 1
    if passive_ratio < 0.05:
        passive_status = "green"
    elif passive_ratio < 0.10:
        passive_status = "amber"
    else:
        passive_status = "red"

    # For demonstration, we simply assign an SEO score based solely on passive voice.
    # In a real scenario, you would perform a full NLP-based SEO analysis.
    if passive_status == "green":
        seo_score = 100
    elif passive_status == "amber":
        seo_score = 75
    else:
        seo_score = 50

    # For readability_score, we'll return a dummy value.
    readability_score = 80

    return SEOAnalyzeOutput(
        seo_score=seo_score,
        readability_score=readability_score,
        passive_ratio=passive_ratio,
        passive_status=passive_status,
    )