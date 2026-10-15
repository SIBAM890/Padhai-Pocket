import json
import hashlib

# 1. BKT verification
with open('shared/bkt_vectors.json', 'r') as f:
    bkt_data = json.load(f)

def bkt_step(p, correct, s, g, t):
    if correct:
        num = p * (1 - s)
        den = num + (1 - p) * g
    else:
        num = p * s
        den = num + (1 - p) * (1 - g)
    p_prime = num / den
    return p_prime + (1 - p_prime) * t

bkt_match = True
for vec in bkt_data['vectors']:
    p = vec['start']
    t = vec['t']
    s = bkt_data['parameters']['s']
    g = bkt_data['parameters']['g']
    for step in vec['steps']:
        p = bkt_step(p, step['correct'], s, g, t)
        diff = abs(round(p, 4) - step['expected_rounded'])
        if diff > 0.0001:
            print(f"BKT mismatch in {vec['id']}: got {p:.6f} (rounded {round(p,4)}), expected {step['expected_rounded']}")
            bkt_match = False
print('BKT vectors match:', bkt_match)

# 2. Probe vectors verification
with open('shared/probe_vectors.json', 'r') as f:
    pv = json.load(f)

table_map = {
    (1,1,1): 'RESOLVED',
    (1,1,0): 'READING_GAP_CANDIDATE',
    (1,0,0): 'LANGUAGE_OR_TERM_GAP_CANDIDATE',
    (0,0,0): 'CONCEPT_GAP_CANDIDATE'
}
pv_match = True
for row in pv['patterns_to_candidate']:
    pat = tuple(row['pattern'])
    expected = row['candidate']
    actual = table_map.get(pat, 'INCONSISTENT')
    if actual != expected:
        print(f"Candidate mismatch for {pat}: got {actual}, expected {expected}")
        pv_match = False

print('CandidateOf patterns match:', pv_match)
