import os
import base64
import binascii
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, hmac, padding
from cryptography.hazmat.backends import default_backend
from dotenv import load_dotenv

load_dotenv()

class FieldEncryption:
    def __init__(self):
        enc_key_hex = os.getenv("FIELD_ENCRYPTION_KEY")
        hmac_key_hex = os.getenv("FIELD_HMAC_KEY")
        
        if not enc_key_hex or not hmac_key_hex:
            print("[Security] Warning: Encryption keys not found in environment!")
            self.enabled = False
            return
            
        try:
            self.enc_key = binascii.unhexlify(enc_key_hex)
            self.hmac_key = binascii.unhexlify(hmac_key_hex)
            self.enabled = True
        except Exception as e:
            print(f"[Security] Error decoding keys: {e}")
            self.enabled = False

    def encrypt(self, plaintext: str) -> str:
        """Encrypts a string using AES-CBC + HMAC-SHA256 (Encrypt-then-MAC)."""
        if not self.enabled or not plaintext:
            return plaintext
            
        try:
            # Padding
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(plaintext.encode()) + padder.finalize()
            
            # Encrypt
            iv = os.urandom(16)
            cipher = Cipher(algorithms.AES(self.enc_key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(padded_data) + encryptor.finalize()
            
            # MAC
            h = hmac.HMAC(self.hmac_key, hashes.SHA256(), backend=default_backend())
            h.update(iv + ciphertext)
            mac = h.finalize()
            
            # Combine IV + Ciphertext + MAC and encode
            combined = iv + ciphertext + mac
            return base64.b64encode(combined).decode('utf-8')
        except Exception as e:
            print(f"[Security] Encryption error: {e}")
            return plaintext

    def decrypt(self, encrypted_b64: str) -> str:
        """Decrypts a base64 string and verifies HMAC."""
        if not self.enabled or not encrypted_b64:
            return encrypted_b64
            
        try:
            data = base64.b64decode(encrypted_b64)
            if len(data) < 16 + 16 + 32: # min length: IV(16) + at least 1 block(16) + MAC(32)
                return encrypted_b64
                
            iv = data[:16]
            mac = data[-32:]
            ciphertext = data[16:-32]
            
            # Verify MAC
            h = hmac.HMAC(self.hmac_key, hashes.SHA256(), backend=default_backend())
            h.update(iv + ciphertext)
            try:
                h.verify(mac)
            except Exception:
                print("[Security] MAC verification failed!")
                return encrypted_b64
                
            # Decrypt
            cipher = Cipher(algorithms.AES(self.enc_key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()
            padded_data = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Unpadding
            unpadder = padding.PKCS7(128).unpadder()
            plaintext = unpadder.update(padded_data) + unpadder.finalize()
            
            return plaintext.decode('utf-8')
        except Exception as e:
            # If decryption fails, it might not be encrypted
            return encrypted_b64

# Singleton instance
crypto = FieldEncryption()
