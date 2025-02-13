from ninja import Schema

class SEOAnalyzeInput(Schema):
    content: str
    title: str
    keyphrase: str
    cornerstone: bool = False

class SEOAnalyzeOutput(Schema):
    seo_score: int
    readability_score: int
    passive_ratio: float
    passive_status: str