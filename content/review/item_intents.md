# Item Pedagogical Intents & Specifications (Review Only)

> [!NOTE]
> This document specifies the English pedagogical intent, scenario parameters, and distractor rationales for the 12 items of the `distance_vs_displacement` hero concept.
> English text in this document is for human review only and DOES NOT enter `content/motion_pack.json`.

---

## 1. Diagnostic Probe Items (Item 3)

### Set A (Parallel Set 1)

#### `DVD-A-P` (Picture Modality)
- **Concept ID**: `distance_vs_displacement`
- **Modality**: `P`
- **Set**: `A`
- **Scenario**: Path diagram on a coordinate grid showing a child walking from home ($O$) to a shop ($A$) 300 m east, then to school ($B$) 400 m north. Total path traversed is $300 + 400 = 700\text{ m}$.
- **Question Intent**: Tap the visual arrow/icon that represents the displacement of the child from home to school.
- **Options**:
  - `img_dvd_a_p_opt0.png` [CORRECT]: Direct straight directed vector arrow from home ($O$) directly to school ($B$) (magnitude 500 m).
  - `img_dvd_a_p_opt1.png` [MISCONCEPTION]: The combined winding bent path along $O \to A \to B$ (700 m).
  - `img_dvd_a_p_opt2.png`: Reverse directed arrow from school ($B$) to home ($O$).
  - `img_dvd_a_p_opt3.png`: Perpendicular segment only ($A \to B$).
- **Misconception Tagged**: `path_length_as_displacement` (confusing full traversed path with displacement vector).
- **Audio Clip**: `DVD-A-P.opus`

#### `DVD-A-A` (Audio Modality)
- **Concept ID**: `distance_vs_displacement`
- **Modality**: `A`
- **Set**: `A`
- **Scenario**: Question read aloud in Odia: "A runner starts at the starting line, runs 100 meters around the track, and returns directly to the starting line. What is the runner's displacement?"
- **Question Intent**: Understand that returning to the starting point results in zero net displacement, even when distance travelled is 200 m.
- **Options** (Pictorial/Voiced only, NO text):
  - `img_dvd_a_a_opt0.png` [CORRECT]: Zero icon / point at starting marker ($0\text{ m}$).
  - `img_dvd_a_a_opt1.png` [MISCONCEPTION]: Two arrows totaling $200\text{ m}$ (total distance).
  - `img_dvd_a_a_opt2.png`: Single arrow of $100\text{ m}$.
  - `img_dvd_a_a_opt3.png`: Half arrow of $50\text{ m}$.
- **Misconception Tagged**: `displacement_cannot_be_zero` (failing to recognize displacement can be zero for a round trip).
- **Audio Clip**: `DVD-A-A.opus`

#### `DVD-A-T` (Text Modality)
- **Concept ID**: `distance_vs_displacement`
- **Modality**: `T`
- **Set**: `A`
- **Scenario**: Odia text problem: A farmer walks along the boundary of a square field of side 10 m from corner $A$ to the diagonally opposite corner $C$.
- **Question Intent**: Distinguish the concept of displacement (straight diagonal path) from distance (boundary path length $10 + 10 = 20\text{ m}$).
- **Options** (Odia text, placeholders in pack):
  - Option 0 [CORRECT]: Straight diagonal length connecting corner $A$ to corner $C$.
  - Option 1 [MISCONCEPTION]: Sum of side lengths traversed ($10\text{ m} + 10\text{ m} = 20\text{ m}$).
  - Option 2: Full boundary perimeter of the field ($40\text{ m}$).
  - Option 3: Zero meters.
- **Misconception Tagged**: `confuses_distance_with_displacement`.
- **Audio Clip**: `DVD-A-T.opus`

---

### Set B (Parallel Set 2 — Distinct Scenario & Numerical Values)

#### `DVD-B-P` (Picture Modality)
- **Concept ID**: `distance_vs_displacement`
- **Modality**: `P`
- **Set**: `B`
- **Scenario**: Path diagram of a girl riding a bicycle around a circular pond of radius $r = 50\text{ m}$. She starts at point $P$ and stops at point $Q$ directly across the pond (half revolution).
- **Question Intent**: Tap the arrow indicating the magnitude and direction of displacement.
- **Options**:
  - `img_dvd_b_p_opt0.png` [CORRECT]: Straight diameter arrow from $P$ to $Q$ ($2r = 100\text{ m}$).
  - `img_dvd_b_p_opt1.png` [MISCONCEPTION]: Curved semicircular boundary arc ($\pi r \approx 157\text{ m}$).
  - `img_dvd_b_p_opt2.png`: Full circle circumference loop.
  - `img_dvd_b_p_opt3.png`: Zero vector.
- **Misconception Tagged**: `path_length_as_displacement`.
- **Audio Clip**: `DVD-B-P.opus`

#### `DVD-B-A` (Audio Modality)
- **Concept ID**: `distance_vs_displacement`
- **Modality**: `A`
- **Set**: `B`
- **Scenario**: Voiced in Odia: "A bird flies 50 meters straight north to fetch food, and immediately flies 50 meters straight south back to its nest. What is the net displacement of the bird?"
- **Question Intent**: Auditory question testing recognition of zero displacement upon return to initial position in a vertical/north-south axis.
- **Options** (Pictorial/Voiced only):
  - `img_dvd_b_a_opt0.png` [CORRECT]: Nest icon with zero displacement ($0\text{ m}$).
  - `img_dvd_b_a_opt1.png` [MISCONCEPTION]: Total path length ($100\text{ m}$).
  - `img_dvd_b_a_opt2.png`: Single journey length ($50\text{ m}$).
  - `img_dvd_b_a_opt3.png`: Half journey length ($25\text{ m}$).
- **Misconception Tagged**: `displacement_cannot_be_zero`.
- **Audio Clip**: `DVD-B-A.opus`

#### `DVD-B-T` (Text Modality)
- **Concept ID**: `distance_vs_displacement`
- **Modality**: `T`
- **Set**: `B`
- **Scenario**: Odia text problem: A bus travels from town $X$ to town $Y$ along a winding mountain road of length 60 km. The straight aerial distance between $X$ and $Y$ is 45 km.
- **Question Intent**: Identify the displacement of the bus from town $X$ to town $Y$.
- **Options**:
  - Option 0 [CORRECT]: 45 km in the direction from $X$ to $Y$.
  - Option 1 [MISCONCEPTION]: 60 km along the highway road (distance).
  - Option 2: 105 km (sum of both lengths).
  - Option 3: 15 km (difference of lengths).
- **Misconception Tagged**: `confuses_distance_with_displacement`.
- **Audio Clip**: `DVD-B-T.opus`

---

## 2. Confirmation & Post-Remediation Items (Item 4)

### `W1` (Word-Concept Matching Confirmation — Set A)
- **Modality**: `W`
- **Set**: `A`
- **Intent**: Spoken term ("ଦୂରତା" / distance) and written term presented simultaneously. Tests lexical recognition isolating reading comprehension.
- **Options** (Strictly Picture Options Only):
  - `img_w1_opt0.png` [CORRECT]: Complete winding footsteps track depicting total path length.
  - `img_w1_opt1.png` [DISTRACTOR]: Straight direct arrow between endpoints (displacement).
  - `img_w1_opt2.png` [DISTRACTOR]: Speedometer gauge (speed).
  - `img_w1_opt3.png` [DISTRACTOR]: Stopwatch clock (time).
- **Misconception Tagged**: `term_misidentification`.
- **Audio Clip**: `W1.opus`

### `W2` (Word-Concept Matching Confirmation — Set B)
- **Modality**: `W`
- **Set**: `B`
- **Intent**: Spoken term ("ବିସ୍ଥାପନ" / displacement) and written term presented simultaneously. Options are strictly picture options only.
- **Options** (Strictly Picture Options Only):
  - `img_w2_opt0.png` [CORRECT]: Direct straight vector arrow from initial position to final position.
  - `img_w2_opt1.png` [DISTRACTOR]: Curved meandering path trace (distance).
  - `img_w2_opt2.png` [DISTRACTOR]: Speedometer dial (speed).
  - `img_w2_opt3.png` [DISTRACTOR]: Stationary rock icon (rest).
- **Misconception Tagged**: `term_misidentification`.
- **Audio Clip**: `W2.opus`

### `TX` (Targeted Confirmation — Reading Gap)
- **Modality**: `TX`
- **Set**: `C`
- **Intent**: Ultra-low reading load statement isolating decoding ability: "Shortest straight distance between initial and final position is called what?"
- **Options** (Text):
  - Option 0 [CORRECT]: Displacement (ବିସ୍ଥାପନ)
  - Option 1 [DISTRACTOR]: Distance (ଦୂରତା)
  - Option 2 [DISTRACTOR]: Speed (ବେଗ)
  - Option 3 [DISTRACTOR]: Rest (ସ୍ଥିର)
- **Misconception Tagged**: `reading_comprehension_confusion`.
- **Audio Clip**: `TX.opus`

### `PX` (Targeted Confirmation — Concept Gap)
- **Modality**: `PX`
- **Set**: `C`
- **Intent**: Visual-only diagram without text. Displays an object travelling around a complete closed rectangular circuit back to its starting mark.
- **Options** (Picture options only):
  - `img_px_opt0.png` [CORRECT]: Net displacement equals zero icon.
  - `img_px_opt1.png` [DISTRACTOR]: Perimeter length arrow (displacement > 0).
  - `img_px_opt2.png` [DISTRACTOR]: Infinite motion symbol.
  - `img_px_opt3.png` [DISTRACTOR]: Reverse arrow.
- **Misconception Tagged**: `concept_confusion_origin_loop`.
- **Audio Clip**: `PX.opus`

### `PM1` (Post-Remediation Parallel MCQ 1)
- **Modality**: `MCQ`
- **Set**: `C`
- **Intent**: Post-remediation verification scenario completely different from all probes: A swimmer swims across a 50 m swimming pool and returns to the starting blocks. Find total distance and displacement.
- **Options** (Text):
  - Option 0 [CORRECT]: Distance = 100 m, Displacement = 0 m.
  - Option 1 [DISTRACTOR]: Distance = 100 m, Displacement = 100 m.
  - Option 2 [DISTRACTOR]: Distance = 0 m, Displacement = 100 m.
  - Option 3 [DISTRACTOR]: Distance = 50 m, Displacement = 50 m.
- **Misconception Tagged**: `displacement_scalar_assumption`.
- **Audio Clip**: `PM1.opus`

### `PM2` (Post-Remediation Parallel MCQ 2)
- **Modality**: `MCQ`
- **Set**: `C`
- **Intent**: Conceptual comparison question: Can the magnitude of displacement ever exceed distance?
- **Options** (Text):
  - Option 0 [CORRECT]: No, magnitude of displacement is always less than or equal to distance.
  - Option 1 [DISTRACTOR]: Yes, displacement is always greater than distance.
  - Option 2 [DISTRACTOR]: Yes, when moving in a circle.
  - Option 3 [DISTRACTOR]: Yes, when speed changes.
- **Misconception Tagged**: `displacement_magnitude_greater_than_distance`.
- **Audio Clip**: `PM2.opus`
