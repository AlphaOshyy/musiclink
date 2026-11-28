# Automatic music tagging, optional pretrained genre classifier

Upload a MUSIC sample to automatically run local Web Audio analysis of tempo (BPM), estimated key and major/minor mode, RMS energy, signal brightness, and heuristic mood and style. The system also attempts broad genre recognition using an ONNX quantized DistilHuBERT classifier through Hugging Face Transformers.js.

The pretrained model has ten broad classes: Blues, Classical, Country, Disco, Hip Hop, Jazz, Metal, Pop, Reggae and Rock. It does NOT recognize subgenres such as Trap, Drill, Boom Bap, Sinhala Rap, Soul or R&B as distinct categories. These require their own labelled training set and evaluation.

The model is downloaded to the visitor's browser on first classification (quantized model approximately 24 MB). Audio is decoded on-device, not uploaded to Hugging Face. Model weights and runtime assets are downloaded from external services and internet access is required for first load. If classification fails, previously saved DSP features remain available and the genre is marked unavailable.

Analysis results include the model ID, top 3 class probabilities, an estimated genre, BPM, key, major/minor mode, energy, heuristic mood, rhythmic strength, and broad style. Server validates ranges and category names but does not verify acoustic truth or model provenance. Genre labels are estimates, not verified musical metadata.

Upload samples should be music rather than isolated vocal recordings for the genre model. The vocal sample option runs separate pitch analysis. Genre classification does not automatically change an artist's self-declared genres or their profile. It also does not override original MCCA matching fields.

Accuracy must be evaluated with independently labelled recordings across local Sinhala rap, Trap, Drill and hybrid styles. The GTZAN-trained classifier has known domain and taxonomy limitations. Avoid describing it as a comprehensive genre detector.
