from ninja import Schema

class PassivTextCheckInput(Schema):
    content: str

class SentimentCheckInput(Schema):
    content: str

class LexicalDiversityCheckInput(Schema):
    content: str

class KeyphraseDistributionCheckInput(Schema):
    content: str
    keyphrase: str

class ReadabilityAssessment(Schema):
    score: int
    max: int
    feedback: str


class SEOAssessment(Schema):
    score: int
    max: int
    feedback: str

# Updated output schema to include only the passive assessment.
class PassiveTextCheckOutput(Schema):
    passive_assessment: ReadabilityAssessment

class KeyphraseDistributionCheckOutput(Schema):
    keyphrase_assessment: SEOAssessment

class SentimentCheckOutput(Schema):
    sentiment_assessment: ReadabilityAssessment

class LexicalDiversityCheckOutput(Schema):
    lexical_diversity_assessment: ReadabilityAssessment