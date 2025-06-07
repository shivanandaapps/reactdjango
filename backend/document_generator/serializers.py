from rest_framework import serializers
from .models import Template, DataFile, DocumentGeneration

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'

class DataFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataFile
        fields = '__all__'

class DocumentGenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentGeneration
        fields = '__all__'
