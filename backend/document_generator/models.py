from django.db import models
from django.core.validators import FileExtensionValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from .validators import validate_document_file_extension, validate_excel_file_extension

def validate_file_size(value):
    limit = 5 * 1024 * 1024  # 5MB
    if value.size > limit:
        raise ValidationError('File size cannot exceed 5MB.')

class Template(models.Model):
    template_file = models.FileField(
        upload_to='templates/',
        validators=[validate_document_file_extension]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    placeholders = models.JSONField(default=list)

class DataFile(models.Model):
    data_file = models.FileField(
        upload_to='data/',
        validators=[validate_excel_file_extension]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    headers = models.JSONField(default=list)

class DocumentGeneration(models.Model):
    template = models.ForeignKey(Template, on_delete=models.CASCADE)
    data_file = models.ForeignKey(DataFile, on_delete=models.CASCADE)
    mapping = models.JSONField()
    output_format = models.CharField(max_length=10)  # docx, pdf, txt
    start_row = models.IntegerField(null=True, blank=True)
    end_row = models.IntegerField(null=True, blank=True)
    filename_pattern = models.CharField(max_length=255, default='document_{{id}}')
    status = models.CharField(max_length=20, default='pending')  # pending, processing, completed, failed
    created_at = models.DateTimeField(auto_now_add=True)
