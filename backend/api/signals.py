from django.db.models.signals import post_delete,post_save
from django.dispatch import receiver
from api.models import Note, Tag
from django.core.cache import cache
from channels_yroom.models import YDocUpdate


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
