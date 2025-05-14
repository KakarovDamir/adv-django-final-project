from django.apps import AppConfig
from django.db.models.signals import post_migrate


def actual_assign_permissions_to_groups(sender, **kwargs):
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType

    print("Signal post_migrate received. Assigning permissions to groups...")

    app_label_sn = 'social_network'
    sn_models_permissions_defs = {
        'post': ['add_post', 'change_post', 'delete_post', 'view_post'],
        'comment': ['add_comment', 'change_comment', 'delete_comment', 'view_comment'],
        'profile': ['add_profile', 'change_profile', 'delete_profile', 'view_profile'],
        'friendrequest': ['add_friendrequest', 'change_friendrequest', 'delete_friendrequest', 'view_friendrequest'],
        'notification': ['add_notification', 'change_notification', 'delete_notification', 'view_notification'],
    }
    
    all_social_network_permissions = []
    for model_name, codenames in sn_models_permissions_defs.items():
        try:
            model_content_type = ContentType.objects.get(app_label=app_label_sn, model=model_name)
            for codename in codenames:
                try:
                    perm = Permission.objects.get(codename=codename, content_type=model_content_type)
                    all_social_network_permissions.append(perm)
                except Permission.DoesNotExist:
                    print(f"  Warning (post_migrate): Permission {codename} for model {model_name} in app {app_label_sn} not found. Skipping.")
        except ContentType.DoesNotExist:
            print(f"  Critical Warning (post_migrate): ContentType for model {model_name} in app {app_label_sn} not found. Skipping model.")

    app_label_chat = 'chat'
    chat_models_permissions_defs = {
        'message': ['add_message', 'change_message', 'delete_message', 'view_message'],
    }
    all_chat_permissions = []
    for model_name, codenames in chat_models_permissions_defs.items():
        try:
            model_content_type = ContentType.objects.get(app_label=app_label_chat, model=model_name)
            for codename in codenames:
                try:
                    perm = Permission.objects.get(codename=codename, content_type=model_content_type)
                    all_chat_permissions.append(perm)
                except Permission.DoesNotExist:
                    print(f"  Warning (post_migrate/chat): Permission {codename} for model {model_name} not found. Skipping.")
        except ContentType.DoesNotExist:
            print(f"  Critical Warning (post_migrate/chat): ContentType for model {model_name} not found. Skipping model.")

    app_label_ai = 'ai'
    ai_models_permissions_defs = {
        'videoprompt': ['add_videoprompt', 'change_videoprompt', 'delete_videoprompt', 'view_videoprompt'],
    }
    all_ai_permissions = []
    for model_name, codenames in ai_models_permissions_defs.items():
        try:
            model_content_type = ContentType.objects.get(app_label=app_label_ai, model=model_name)
            for codename in codenames:
                try:
                    perm = Permission.objects.get(codename=codename, content_type=model_content_type)
                    all_ai_permissions.append(perm)
                except Permission.DoesNotExist:
                    print(f"  Warning (post_migrate/ai): Permission {codename} for model {model_name} not found. Skipping.")
        except ContentType.DoesNotExist:
            print(f"  Critical Warning (post_migrate/ai): ContentType for model {model_name} not found. Skipping model.")

    try:
        user_group, _ = Group.objects.get_or_create(name='User')
        user_perms_to_assign = []
        user_sn_codenames = {
            'post': ['add_post', 'view_post'], 'comment': ['add_comment', 'view_comment'],
            'profile': ['view_profile'], 
            'friendrequest': ['add_friendrequest', 'view_friendrequest', 'change_friendrequest', 'delete_friendrequest'],
            'notification': ['view_notification', 'change_notification', 'delete_notification']
        }
        for model_name, codenames in user_sn_codenames.items():
            model_content_type = ContentType.objects.get(app_label=app_label_sn, model=model_name)
            for codename in codenames: user_perms_to_assign.append(Permission.objects.get(codename=codename, content_type=model_content_type))
        
        model_content_type = ContentType.objects.get(app_label=app_label_chat, model='message')
        for codename in chat_models_permissions_defs['message']: user_perms_to_assign.append(Permission.objects.get(codename=codename, content_type=model_content_type))
        
        model_content_type = ContentType.objects.get(app_label=app_label_ai, model='videoprompt')
        for codename in ['add_videoprompt', 'view_videoprompt']: user_perms_to_assign.append(Permission.objects.get(codename=codename, content_type=model_content_type))
        
        user_group.permissions.set(user_perms_to_assign)
        print(f"  Permissions for group 'User' set ({len(user_perms_to_assign)} permissions).")
    except Group.DoesNotExist:
        print("  Warning (post_migrate): Group 'User' not found during permission assignment.")
    except ContentType.DoesNotExist as e:
        print(f"  Critical Warning (post_migrate/User): ContentType not found: {e}")
    except Permission.DoesNotExist as e:
        print(f"  Critical Warning (post_migrate/User): Permission not found: {e}")

    try:
        editor_group, _ = Group.objects.get_or_create(name='Editor')
        editor_perms_to_assign = []
        editor_sn_codenames = sn_models_permissions_defs
        for model_name, codenames in editor_sn_codenames.items():
             model_content_type = ContentType.objects.get(app_label=app_label_sn, model=model_name)
             for codename in codenames: editor_perms_to_assign.append(Permission.objects.get(codename=codename, content_type=model_content_type))
        
        model_content_type = ContentType.objects.get(app_label=app_label_chat, model='message')
        for codename in chat_models_permissions_defs['message']: editor_perms_to_assign.append(Permission.objects.get(codename=codename, content_type=model_content_type))
        
        model_content_type = ContentType.objects.get(app_label=app_label_ai, model='videoprompt')
        for codename in ai_models_permissions_defs['videoprompt']: editor_perms_to_assign.append(Permission.objects.get(codename=codename, content_type=model_content_type))

        editor_group.permissions.set(editor_perms_to_assign)
        print(f"  Permissions for group 'Editor' set ({len(editor_perms_to_assign)} permissions).")
    except Group.DoesNotExist:
        print("  Warning (post_migrate): Group 'Editor' not found.")
    except ContentType.DoesNotExist as e:
        print(f"  Critical Warning (post_migrate/Editor): ContentType not found: {e}")
    except Permission.DoesNotExist as e:
        print(f"  Critical Warning (post_migrate/Editor): Permission not found: {e}")

    try:
        admin_group, _ = Group.objects.get_or_create(name='Administrator')
        all_permissions = list(Permission.objects.filter(
            content_type__app_label__in=[app_label_sn, app_label_chat, app_label_ai]
        ))
        admin_group.permissions.set(all_permissions)
        print(f"  Permissions for group 'Administrator' set ({len(all_permissions)} permissions).")
    except Group.DoesNotExist:
        print("  Warning (post_migrate): Group 'Administrator' not found.")
    print("Permission assignment finished.")

class SocialNetworkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'social_network'

    def ready(self):
        print(f"SocialNetworkConfig ready. Connecting post_migrate signal...")
        post_migrate.connect(actual_assign_permissions_to_groups, dispatch_uid="social_network.actual_assign_permissions_to_groups")
        print("post_migrate signal connected.")
