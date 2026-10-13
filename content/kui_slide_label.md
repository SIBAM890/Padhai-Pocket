# Kui Glossary UI Slide Labels & Display Specifications

## 1. Validated-Count Status Label
When one or more Kui audio clips have been validated by an attested native speaker and approved in `content/review_log.csv`:

```text
Kui Audio Glossary: {validated_count}/{total_count} terms verified by native speakers
```

*Example for Motion Chapter*:
> `Kui Audio Glossary: 0/6 terms verified by native speakers`

---

## 2. Fallback Label (Unvalidated / Draft State)
When zero Kui audio clips have been validated by native speakers (current state):

```text
Kui starter glossary — text-only in Odia script; native audio pending validation
```

---

## 3. Implementation Rules
1. **No Artificial Audio Presentation**: Never present unverified or machine-synthesized speech as verified Kui audio.
2. **Visual Fallback Indication**: If `kui.audio` is null or `status` is `"pending"`, the audio speaker icon must be disabled/greyed out with an indicator that native recording validation is pending.
3. **Child Safety & Trust**: The child UI must transparently reflect dialect and verification state so learners and teachers know which explanations are native-attested.
