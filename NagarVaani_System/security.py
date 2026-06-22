"""
security.py — Field-level encryption matching the NagarVaani Web App
Format: AES-256-GCM stored as "iv_hex:authTag_hex:ciphertext_hex"
"""

import os
import binascii
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from dotenv import load_dotenv

load_dotenv()

# Fields that the web app encrypts
ENCRYPTED_FIELDS = [
    'aadhaar_number', 'voter_id', 'annual_income',
    'land_acres', 'date_of_birth', 'full_name',
]

class FieldEncryption:
    def __init__(self):
        enc_key_hex = os.getenv("FIELD_ENCRYPTION_KEY")
        hmac_key_hex = os.getenv("FIELD_HMAC_KEY")
        
        if not enc_key_hex or len(enc_key_hex) != 64:
            print("[Security] Warning: FIELD_ENCRYPTION_KEY not found or invalid!")
            self.enabled = False
            return
            
        try:
            self.enc_key = binascii.unhexlify(enc_key_hex)
            self.hmac_key = binascii.unhexlify(hmac_key_hex) if hmac_key_hex else None
            self.aesgcm = AESGCM(self.enc_key)
            self.enabled = True
            print("[Security] AES-256-GCM encryption ready ✓")
        except Exception as e:
            print(f"[Security] Error initializing: {e}")
            self.enabled = False

    def encrypt(self, plaintext: str) -> str:
        """Encrypt using AES-256-GCM → 'iv_hex:authTag_hex:ciphertext_hex'"""
        if not self.enabled or not plaintext:
            return plaintext
        try:
            iv = os.urandom(12)  # 96-bit IV for GCM
            ct_with_tag = self.aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
            # GCM appends 16-byte tag to ciphertext
            ciphertext = ct_with_tag[:-16]
            auth_tag = ct_with_tag[-16:]
            return f"{iv.hex()}:{auth_tag.hex()}:{ciphertext.hex()}"
        except Exception as e:
            print(f"[Security] Encrypt error: {e}")
            return plaintext

    def decrypt(self, stored: str) -> str:
        """Decrypt 'iv_hex:authTag_hex:ciphertext_hex' → plaintext"""
        if not self.enabled or not stored:
            return stored
        try:
            parts = stored.split(':')
            if len(parts) != 3:
                return stored  # Not encrypted
            
            iv_hex, auth_tag_hex, ciphertext_hex = parts
            iv = binascii.unhexlify(iv_hex)
            auth_tag = binascii.unhexlify(auth_tag_hex)
            ciphertext = binascii.unhexlify(ciphertext_hex)
            
            # GCM expects ciphertext + tag concatenated
            ct_with_tag = ciphertext + auth_tag
            plaintext = self.aesgcm.decrypt(iv, ct_with_tag, None)
            return plaintext.decode('utf-8')
        except Exception as e:
            # Not encrypted or wrong key — return as-is
            return stored

# Singleton
crypto = FieldEncryption()
