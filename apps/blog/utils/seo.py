def contains_keyphrase_variation(segment: str, keyphrase: str, nlp_model) -> bool:
    # Convert both texts to lowercase and create spaCy documents
    seg_doc = nlp_model(segment.lower())
    keyphrase_doc = nlp_model(keyphrase.lower())
    
    # Create sets of lemmas for comparison, filtering out stop words from the keyphrase
    seg_lemmas = {token.lemma_ for token in seg_doc}
    key_lemmas = {token.lemma_ for token in keyphrase_doc if not token.is_stop}
    
    # Check if all keyphrase lemmas are present in the segment
    return key_lemmas.issubset(seg_lemmas)
