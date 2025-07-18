# filepath: /c:/Users/Admin/Documents/Koding/PASSWOWN/back-end.py
import os
import hashlib
import uuid
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
from nacl import secret, utils
from nacl.encoding import Base64Encoder

class cryptomanager():
    def generate_key(password, salt=None):
        if salt is None:
            salt = os.urandom(16)  # Generate a random 16-byte salt
        hashed_password = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000, dklen=32)
        return hashed_password, salt

    def encrypt_message(message, key):  # Encrypt the message using the key
        return secret.SecretBox(key).encrypt(message.encode(), encoder=Base64Encoder)

    def decrypt_message(encrypted_message, key):  # Decrypt the message using the key
        try:
            decrypted = secret.SecretBox(key).decrypt(encrypted_message, encoder=Base64Encoder)
        except KeyError:
            return "Wrong key or message corrupted"
        else:
            return decrypted.decode()

    def decrypt_using_backup(encrypted_message, password):  # Decrypt the message using the backup password
        key = password.ljust(32)[:32].encode()  # Ensure the key is 32 bytes long
        return cryptomanager.decrypt_message(encrypted_message, key)

class syncmanager():
    def authenticate_and_upload(safe_name, content="test", auth_file=None):
        gauth = GoogleAuth()

        if auth_file:  # Load the specified auth file
            gauth.LoadCredentialsFile(auth_file)
            if gauth.credentials is None or gauth.access_token_expired:
                gauth.LocalWebserverAuth()
                gauth.SaveCredentialsFile(auth_file)
            else:
                gauth.Authorize()
        else:  # Authenticate if no auth file is provided
            gauth.LocalWebserverAuth()
            drive = GoogleDrive(gauth)
            about = drive.GetAbout()
            email = about['user']['emailAddress']
            auth_filename = email.split('@')[0] + '.auth'

            # Determine the next available number for the auth file
            i = 1
            while os.path.exists(f"{i}_{auth_filename}"):
                i += 1

            # Save the credentials with the new filename
            gauth.SaveCredentialsFile(f"{i}_{auth_filename}")

        drive = GoogleDrive(gauth)

        # Create a file and upload it
        unique_filename = f"{safe_name}_{uuid.uuid1()}"
        file1 = drive.CreateFile({'title': unique_filename})  # Create a file with a unique title
        file1.SetContentString(content)  # Set content of the file
        file1.Upload()

    def read_file(auth_file, read_file):
        gauth = GoogleAuth()
        gauth.LoadCredentialsFile(auth_file)
        if gauth.credentials is None or gauth.access_token_expired:
            gauth.Refresh()
        else:
            gauth.Authorize()
        drive = GoogleDrive(gauth)
        file_list = drive.ListFile({'q': f"title contains '{read_file}'"}).GetList()
        if file_list:
            file1 = file_list[0]
            file1.GetContentFile(read_file)
            with open(read_file, 'r') as f:
                content = f.read()
            return content
        else:
            return "404"

    def list_auth_files():
        return [f for f in os.listdir() if f.endswith('.auth')]

def upload_menu():
    while True:
        print("Upload Menu")
        print("0. Authenticate and Save Credentials")
        auth_files = syncmanager.list_auth_files()
        for i, auth_file in enumerate(auth_files, start=1):
            print(f"{i}. Upload File using {auth_file}")
        print(f"{len(auth_files) + 1}. Back to Main Menu")
        choice = input("Enter your choice: ")

        if choice == '0':
            syncmanager.authenticate_and_upload(safe_name="NentriaData")
        elif choice.isdigit() and 1 <= int(choice) <= len(auth_files):
            syncmanager.authenticate_and_upload(auth_file=auth_files[int(choice) - 1], safe_name="NentriaData")
        elif choice == str(len(auth_files) + 1):
            break
        else:
            print("Invalid choice. Please try again.")

def read_menu():
    while True:
        print("Read Menu")
        auth_files = syncmanager.list_auth_files()
        for i, auth_file in enumerate(auth_files, start=1):
            print(f"{i}. Read File using {auth_file}")
        print(f"{len(auth_files) + 1}. Back to Main Menu")
        choice = input("Enter your choice: ")

        if choice.isdigit() and 1 <= int(choice) <= len(auth_files):
            content = syncmanager.read_file(auth_files[int(choice) - 1], "NentriaData")
            print(content)
        elif choice == str(len(auth_files) + 1):
            break
        else:
            print("Invalid choice. Please try again.")
