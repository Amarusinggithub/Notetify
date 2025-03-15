from django import forms
from django.contrib.auth.models import User

from api.models import Note


class RegistrationForm(forms.Form):
    email = forms.EmailField(required=True)
    username = forms.CharField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("Username is already taken.")
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email is already registered.")
        return email


class LoginForm(forms.Form):
    username = forms.CharField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)


class NoteForm(forms.ModelForm):
    title = forms.CharField(max_length=500, required=True, label="Title")
    content = forms.CharField(widget=forms.Textarea, required=True, label="Content")

    class Meta:
        model = Note
        fields = ['title', 'content']
