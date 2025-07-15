from django.db.models.signals import post_delete,post_save
from api.models import Note, Tag
from django.core.cache import cache
from channels_yroom.models import YDocUpdate
from django.utils.html import strip_tags


from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse

from django_rest_passwordreset.signals import reset_password_token_created


@receiver([post_save,post_delete], sender=Note)
def invalidate_note_cache(sender,instance,**kwargs):
    print("clearing note cache")
    cache.delete_pattern('*notes*')


@receiver([post_save, post_delete], sender=Tag)
def invalidate_tag_cache(sender, instance, **kwargs):
    print("clearing tag cache")
    cache.delete_pattern("*tags*")

"""
@receiver(post_save, sender=YDocUpdate)
def link_ydoc_to_note(sender, instance, created, **kwargs):
    #After django-yroom writes a YDocUpdate(name="api.Note:<pk>"), 5this
    #parse out <pk> and assign instance into the Note.ydoc field.

    prefix = f"{Note._meta.app_label}.{Note._meta.model_name}:"
    if instance.name.startswith(prefix):
        pk = instance.name[len(prefix) :]
        try:
            note = Note.objects.get(pk=pk)
            # only save if it isn’t already linked
            if note.ydoc_id != instance.pk:
                note.ydoc = instance
                note.save(update_fields=["ydoc"])
        except Note.DoesNotExist:
            pass
"""


@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "http://localhost:5173/"
    token = "{}".format(reset_password_token.key)
    full_link = str(sitelink) + str("password-reset/") + str(token)

    print(token)
    print(full_link)

    context = {"full_link": full_link, "email_adress": reset_password_token.user.email}

    html_message = render_to_string("backend/email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject="Request for resetting password for {title}".format(
            title=reset_password_token.user.email
        ),
        body=plain_message,
        from_email="sender@example.com",
        to=[reset_password_token.user.email],
    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()
