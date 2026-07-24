from pydantic import BaseModel, Field, model_validator
from typing import Optional

class RegisterUser(BaseModel):
    email: str
    # Enforces a minimum length of 8 characters for professional security
    password: str = Field(..., min_length=8)
    confirm_password: str

    @model_validator(mode="after")
    def verify_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class LoginUser(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)
    confirm_new_password: str

    @model_validator(mode="after")
    def verify_new_passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match")
        return self

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordSubmit(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)