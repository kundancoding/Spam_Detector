import re
import torch
import torch.nn.functional as F
from transformers import BertTokenizer, BertForSequenceClassification

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
model.load_state_dict(torch.load("phishing_model.pt", map_location=torch.device("cpu")))
model.eval()

PHISH_TRIGGERS = ["verify", "click here", "password", "urgent", "account", "log in", "update", "limited time"]

def classify_message(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)
    confidence = probs[0][1].item()
    label = "Suspicious" if confidence > 0.6 else "Safe"
    explanation = generate_explanation(text)
    spam_emails = extract_email_addresses(text) if label == "Suspicious" else []
    return label, round(confidence, 3), explanation, spam_emails

def generate_explanation(text):
    found = [word for word in PHISH_TRIGGERS if word in text.lower()]
    if found:
        return f"⚠️ Contains risky words: {', '.join(found)}"
    return "✅ Message seems safe and doesn’t match phishing patterns."

def extract_email_addresses(text):
    return re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)