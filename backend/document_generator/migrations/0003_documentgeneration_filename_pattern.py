# Generated by Django 5.2.1 on 2025-05-31 20:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('document_generator', '0002_remove_documentgeneration_output_folder'),
    ]

    operations = [
        migrations.AddField(
            model_name='documentgeneration',
            name='filename_pattern',
            field=models.CharField(default='document_{{id}}', max_length=255),
        ),
    ]
