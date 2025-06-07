import os
from django.core.exceptions import ValidationError

def validate_file_extension_and_size(value, allowed_extensions, error_message):
    if not value.name:
        raise ValidationError('No file was submitted.')
      # Check file size - 5MB limit
    if value.size > 5 * 1024 * 1024:  # 5MB in bytes
        raise ValidationError('File size cannot exceed 5MB.')
    
    ext = os.path.splitext(value.name)[1].lower()
    if not ext:
        raise ValidationError('File has no extension.')
    
    if ext not in allowed_extensions:
        raise ValidationError(error_message)

def validate_document_file_extension(value):
    allowed_extensions = ['.doc', '.docx']
    error_message = f'Unsupported file format. Please upload a file with one of these extensions: {", ".join(allowed_extensions)}'
    validate_file_extension_and_size(value, allowed_extensions, error_message)

def validate_excel_file_extension(value):
    allowed_extensions = ['.xls', '.xlsx', '.xlsm']
    error_message = f'Unsupported file format. Please upload a file with one of these extensions: {", ".join(allowed_extensions)}'
    validate_file_extension_and_size(value, allowed_extensions, error_message)
