from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Note, User, UserNote


# Create your tests here.
class NoteApiTestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            first_name="jake",
            last_name="campbell",
            username="admin",
            password="adminpass",
            email="admin123@gmail.com",
        )
        self.normal_user = User.objects.create_user(
            username="user",
            first_name="john",
            last_name="johnson",
            password="userpassword",
            email="user123@gmail.com",
        )
        self.note = Note.objects.create(title="Note Title", content="note Content")
        self.note.users.add(self.normal_user)
        self.userNote = UserNote.objects.get(note=self.note, user=self.normal_user)
        self.url = reverse("notes-detail", kwargs={"pk": self.note.pk})
        # self.client.force_authenticate(user=self.normal_user)
        self.client.login(email="user123@gmail.com", password="userpassword")

    def test_get_userNote(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.userNote.id)

    def test_put_userNote(self):
        data={"id":1,"is_pinned":True}
        response = self.client.put(self.url,data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    #def test_add_userNote(self):

      #  data = {"note_data": {"title": "True", "content": "False"}}
       # response = self.client.post(self.url,data)
       # self.assertEqual(response.status_code, status.HTTP_200_OK)
