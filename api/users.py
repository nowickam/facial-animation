from werkzeug.security import generate_password_hash, check_password_hash

class User():
    """
    Class holding the database of users
    """
    def __init__(self, username, password):
        self.name = username
        self.password = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password, password)

users = [
    User('1', "1"),
    User('user', 'pass')
]

def load_user(username):
    for user in users:
        if username == user.name:
            return user
    return None
