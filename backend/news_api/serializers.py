from rest_framework import serializers
from .models import Article, Category, Source, Subscriber, Author, Comment, Bookmark, ReadingHistory, UserPreference, Notification, CommentReport, CommentLike

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
    replies = serializers.SerializerMethodField()
    parent_id = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), source='parent', write_only=True, required=False, allow_null=True)
    parent = serializers.PrimaryKeyRelatedField(read_only=True)
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'article', 'author_name', 'author_email', 'content', 'created_at', 'updated_at', 'is_approved', 'parent', 'parent_id', 'replies', 'likes', 'user_has_liked']
        read_only_fields = ['created_at', 'updated_at', 'is_approved', 'parent', 'replies', 'likes', 'user_has_liked']
    
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
    
    def get_replies(self, obj):
        # Hanya kembalikan reply jika komentar ini adalah parent
        if obj.replies.exists():
            # Sertakan request context untuk menentukan apakah user telah menyukai reply
            context = self.context.copy()
            return CommentSerializer(obj.replies.filter(is_approved=True).order_by('created_at'), many=True, context=context).data
        return []
        
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return CommentLike.objects.filter(user=request.user, comment=obj).exists()
        return False

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

class BookmarkSerializer(serializers.ModelSerializer):
    article = ArticleSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all(), source='article', write_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'article', 'article_id', 'created_at']
        read_only_fields = ['user', 'created_at']


class ReadingHistorySerializer(serializers.ModelSerializer):
    article = ArticleSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(queryset=Article.objects.all(), source='article', write_only=True)

    class Meta:
        model = ReadingHistory
        fields = ['id', 'user', 'article', 'article_id', 'timestamp']
        read_only_fields = ['user', 'timestamp']


class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ['id', 'user', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class CommentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentReport
        fields = ['id', 'comment', 'reason', 'description', 'created_at', 'resolved', 'resolved_at']
        read_only_fields = ['user', 'created_at', 'resolved', 'resolved_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'article', 'related_comment', 'related_user']
        read_only_fields = ['user', 'created_at']

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_categories = CategorySerializer(read_only=True, many=True)
    preferred_categories_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='preferred_categories',
        many=True,
        write_only=True
    )
    preferred_sources = SourceSerializer(read_only=True, many=True)
    preferred_sources_ids = serializers.PrimaryKeyRelatedField(
        queryset=Source.objects.all(),
        source='preferred_sources',
        many=True,
        write_only=True
    )

    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'preferred_categories', 'preferred_categories_ids',
            'preferred_sources', 'preferred_sources_ids', 'newsletter_subscription',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
