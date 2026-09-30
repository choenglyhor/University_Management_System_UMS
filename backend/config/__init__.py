import re
import django.utils.cache

# Django 6.x compatibility shim for djangorestframework
if not hasattr(django.utils.cache, 'cc_delim_re'):
    setattr(django.utils.cache, 'cc_delim_re', re.compile(r'\s*,\s*'))

# MSSQL uniqueidentifier compatibility: MSSQL natively accepts formatted UUIDs
try:
    import mssql.features
    mssql.features.DatabaseFeatures.has_native_uuid_field = True
except Exception:
    pass
