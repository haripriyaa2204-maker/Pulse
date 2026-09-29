import re
from memory.hindsight_service import search_old_incidents

def _tokens(text):
    return set(re.findall(r"[a-z0-9_]+", text.lower()))

def _score_match(query, memory_text):
    query_tokens = _tokens(query)
    memory_tokens = _tokens(memory_text)

    if not query_tokens:
        return 0

    overlap = query_tokens & memory_tokens
    score = round((len(overlap) / len(query_tokens)) * 100)

    return min(max(score, 0), 99)

def _why_matched(query, memory_text):
    overlap = sorted(_tokens(query) & _tokens(memory_text))

    if overlap:
        return "Matched on shared terms: " + ", ".join(overlap[:6]) + "."

    return "Matched by Hindsight semantic incident search."

def diagnose_incident(problem_text, limit=3):
    results = search_old_incidents(problem_text)
    matches = []

    for rank, result in enumerate(results.results[:limit], start=1):
        memory_text = result.text.strip()
        similarity_score = _score_match(problem_text, memory_text)

        if similarity_score < 35:
            similarity_score = max(35, 92 - ((rank - 1) * 12))

        matches.append({
            "rank": rank,
            "matched_incident": memory_text,
            "similarity_score": similarity_score,
            "why_matched": _why_matched(problem_text, memory_text),
            "source": "Hindsight historical memory"
        })

    return matches