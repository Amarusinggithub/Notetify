from django.db.models.signals import post_delete,post_save
from django.dispatch import receiver
from api.models import Note, Tag
from django.core.cache import cache 


@receiver([post_save,post_delete], sender=Note)
def invalidate_note_cache(sender,instance,**kwargs):
    print("clearing note cache")

    cache.delete_pattern('*notes*')


@receiver([post_save, post_delete], sender=Tag)
def invalidate_tag_cache(sender, instance, **kwargs):
    print("clearing tag cache")

    cache.delete_pattern("*tags*")
