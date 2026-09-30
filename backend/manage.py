#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import re

# Compatibility shim for Django 6+ and DRF 3.15
try:
    import django.utils.cache
    if not hasattr(django.utils.cache, 'cc_delim_re'):
        setattr(django.utils.cache, 'cc_delim_re', re.compile(r'\s*,\s*'))
    import mssql.features
    mssql.features.DatabaseFeatures.has_native_uuid_field = True
except Exception:
    pass

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
