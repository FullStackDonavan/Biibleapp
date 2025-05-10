from datasets import load_dataset

print("🚀 Loading dataset...")
dataset = load_dataset("bible-nlp/biblenlp-corpus", split="train", trust_remote_code=True)

# Print all translation keys
unique_translations = set()
for i in range(100):  # Checking first 100 verses
    unique_translations.update(dataset[i]["translation"]["language"])

print("✅ Available Translations:", unique_translations)
