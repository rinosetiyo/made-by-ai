from rest_framework import serializers
from .models import Article, Category, Source, Subscriber, Author, Comment

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'parent_name', 'description', 'created_at', 'subcategories']
    
    def validate_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Name must not exceed 100 characters.")
        return value
    
    def validate_slug(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Slug must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Slug must not exceed 100 characters.")
        return value
    
    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Description must not exceed 500 characters.")
        return value
    
    def get_subcategories(self, obj):
        # Hanya kembalikan sub-kategori jika kategori ini adalah kategori induk
        if obj.subcategories.exists():
            return CategorySerializer(obj.subcategories.all(), many=True).data
        return []

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ['id', 'name', 'slug', 'logo']
    
    def validate_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Name must not exceed 100 characters.")
        return value
    
    def validate_slug(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Slug must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Slug must not exceed 100 characters.")
        return value

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'subscribed_at']
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'email', 'bio', 'profile_image', 'created_at']
    
    def validate_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Name must not exceed 100 characters.")
        return value
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value
    
    def validate_bio(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Bio must not exceed 1000 characters.")
        return value

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'article', 'author_name', 'author_email', 'content', 'created_at', 'updated_at', 'is_approved']
        read_only_fields = ['created_at', 'updated_at', 'is_approved']
    
    def validate_author_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Name must not exceed 100 characters.")
        return value
    
    def validate_author_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value
    
    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Content is required.")
        if len(value) > 1000:
            raise serializers.ValidationError("Content must not exceed 1000 characters.")
        return value

class ArticleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    source = SourceSerializer(read_only=True)
    author_detail = AuthorSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'author', 'publication_date', 'category', 'source', 'read_time', 'image', 'author_detail', 'comments']
    
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        if len(value) > 200:
            raise serializers.ValidationError("Title must not exceed 200 characters.")
        return value
    
    def validate_content(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Content must be at least 10 characters long.")
        return value
    
    def validate_author(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Author name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Author name must not exceed 100 characters.")
        return value
    
    def validate_read_time(self, value):
        if value < 1:
            raise serializers.ValidationError("Read time must be at least 1 minute.")
        if value > 300:  # 5 hours max
            raise serializers.ValidationError("Read time must not exceed 300 minutes.")
        return value
