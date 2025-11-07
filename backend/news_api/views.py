from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework import serializers, permissions
from rest_framework.authtoken.models import Token
from .models import Article, Category, Source, Subscriber, Author, Comment, Bookmark, ReadingHistory, UserPreference, CommentLike
from .serializers import ArticleSerializer, CategorySerializer, SourceSerializer, SubscriberSerializer, AuthorSerializer, CommentSerializer, BookmarkSerializer, ReadingHistorySerializer, UserPreferenceSerializer

class ArticleList(generics.ListAPIView):
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.select_related('category', 'source', 'author_detail').all()
        
        # Pencarian berdasarkan judul dan konten
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query)
            )
        
        # Filter berdasarkan kategori
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter berdasarkan penulis
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_detail_id=author_id)
        
        # Filter berdasarkan tanggal
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(publication_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(publication_date__lte=date_to)
        
        # Urutkan berdasarkan tanggal publikasi (terbaru dulu)
        queryset = queryset.order_by('-publication_date')
        
        return queryset

class ArticleDetail(generics.RetrieveAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.prefetch_related('subcategories').all()
    serializer_class = CategorySerializer

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.prefetch_related('subcategories').all()
    serializer_class = CategorySerializer

class CategoryArticlesList(generics.ListAPIView):
    serializer_class = ArticleSerializer

    def get_queryset(self):
        category_id = self.kwargs['pk']
        return Article.objects.select_related('category', 'source', 'author_detail').filter(category_id=category_id)

class SourceList(generics.ListAPIView):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer

class AuthorList(generics.ListCreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

class AuthorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

class AuthorArticlesList(generics.ListAPIView):
    serializer_class = ArticleSerializer

    def get_queryset(self):
        author_id = self.kwargs['pk']
        return Article.objects.select_related('category', 'source', 'author_detail').filter(author_detail_id=author_id)

class CommentListCreate(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        article_id = self.kwargs['article_pk']
        # Hanya tampilkan komentar utama (bukan reply) yang telah disetujui
        return Comment.objects.filter(article_id=article_id, is_approved=True, parent__isnull=True).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        article_id = self.kwargs['article_pk']
        try:
            article = Article.objects.get(pk=article_id)
            
            # Jika komentar ini adalah reply, pastikan parent komentar valid
            parent = serializer.validated_data.get('parent')
            if parent:
                # Validasi bahwa parent adalah komentar dari artikel yang sama
                if parent.article_id != article_id:
                    raise serializers.ValidationError("Reply must be to a comment on the same article.")
            
            serializer.save(article=article)
        except Article.DoesNotExist:
            raise serializers.ValidationError("Article does not exist")

class CommentModerationView(APIView):
    """
    View untuk admin untuk mengelola komentar (approve/reject)
    """
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
            action = request.data.get('action')
            
            if action == 'approve':
                comment.is_approved = True
                comment.save()
                return Response({'message': 'Comment approved'}, status=status.HTTP_200_OK)
            elif action == 'reject':
                comment.is_approved = False
                comment.save()
                return Response({'message': 'Comment rejected'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid action. Use "approve" or "reject"'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

class SubscribeView(APIView):
    permission_classes = []  # Tidak ada izin yang diperlukan untuk subscribe
    
    def post(self, request, format=None):
        serializer = SubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookmarkListCreateView(generics.ListCreateAPIView):
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Bookmark.objects.filter(user=user)
        else:
            # Jika tidak login, kembalikan queryset kosong
            return Bookmark.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated:
            serializer.save(user=user)
        else:
            # Jika tidak login, bisa menangani dengan cara tertentu
            # Misalnya membuat bookmark sementara atau mengembalikan error
            raise serializers.ValidationError("Authentication required")

class BookmarkDeleteView(generics.DestroyAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Bookmark.objects.filter(user=user)
        else:
            return Bookmark.objects.none()

class UserBookmarksView(APIView):
    """
    View untuk mendapatkan bookmark berdasarkan user ID
    """
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            bookmarks = Bookmark.objects.filter(user=user)
            serializer = BookmarkSerializer(bookmarks, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ArticleBookmarksView(APIView):
    """
    View untuk mengecek apakah artikel tertentu telah di-bookmark oleh user
    """
    def get(self, request, article_id):
        user = request.user
        if user.is_authenticated:
            try:
                bookmark = Bookmark.objects.get(user=user, article_id=article_id)
                serializer = BookmarkSerializer(bookmark)
                return Response(serializer.data)
            except Bookmark.DoesNotExist:
                return Response({'is_bookmarked': False}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    def post(self, request, article_id):
        # Membuat bookmark baru
        user = request.user
        if user.is_authenticated:
            article = Article.objects.get(id=article_id)
            bookmark, created = Bookmark.objects.get_or_create(user=user, article=article)
            if created:
                serializer = BookmarkSerializer(bookmark)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                # Jika bookmark sudah ada, kembalikan data yang ada
                serializer = BookmarkSerializer(bookmark)
                return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, article_id):
        # Menghapus bookmark
        user = request.user
        if user.is_authenticated:
            try:
                bookmark = Bookmark.objects.get(user=user, article_id=article_id)
                bookmark.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Bookmark.DoesNotExist:
                return Response({'error': 'Bookmark not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

class RelatedArticlesView(APIView):
    """
    View untuk mendapatkan artikel terkait berdasarkan kategori yang sama
    """
    def get(self, request, article_id):
        try:
            article = Article.objects.select_related('category').get(id=article_id)
            category = article.category
            
            if category:
                # Ambil artikel lain dalam kategori yang sama, exclude artikel saat ini
                related_articles = Article.objects.select_related('category', 'source', 'author_detail').filter(
                    category=category
                ).exclude(
                    id=article_id
                ).order_by('-publication_date')[:4]  # Ambil 4 artikel terbaru
                
                serializer = ArticleSerializer(related_articles, many=True)
                return Response(serializer.data)
            else:
                # Jika artikel tidak memiliki kategori, kembalikan array kosong
                return Response([])
                
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)

class MultiSearchView(APIView):
    """
    View untuk pencarian lintas model (artikel, penulis, kategori)
    """
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({
                'articles': [],
                'authors': [],
                'categories': [],
                'sources': []
            })
        
        try:
            # Cari artikel berdasarkan judul, konten, atau penulis
            articles = Article.objects.select_related('author_detail', 'category', 'source').filter(
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(author__icontains=query) |
                Q(author_detail__name__icontains=query)
            ).distinct()[:10]  # Batasi 10 hasil
            
            # Cari penulis berdasarkan nama atau email
            authors = Author.objects.filter(
                Q(name__icontains=query) |
                Q(email__icontains=query) |
                Q(bio__icontains=query)
            ).distinct()[:5]  # Batasi 5 hasil
            
            # Cari kategori berdasarkan nama
            categories = Category.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query)
            ).distinct()[:5]  # Batasi 5 hasil
            
            # Cari sumber berdasarkan nama
            sources = Source.objects.filter(
                Q(name__icontains=query)
            ).distinct()[:5]  # Batasi 5 hasil
            
            # Serialisasi hasil
            article_serializer = ArticleSerializer(articles, many=True)
            author_serializer = AuthorSerializer(authors, many=True)
            category_serializer = CategorySerializer(categories, many=True)
            source_serializer = SourceSerializer(sources, many=True)
            
            return Response({
                'articles': article_serializer.data,
                'authors': author_serializer.data,
                'categories': category_serializer.data,
                'sources': source_serializer.data
            })
        except Exception as e:
            return Response({
                'error': 'An error occurred during search',
                'articles': [],
                'authors': [],
                'categories': [],
                'sources': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReadingHistoryView(APIView):
    """
    View to manage reading history for authenticated users.
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get reading history for the authenticated user
            history_items = ReadingHistory.objects.filter(user=request.user).select_related('article__author_detail', 'article__category', 'article__source')[:20]  # Get last 20 articles
            serializer = ReadingHistorySerializer(history_items, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to fetch reading history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        article_id = request.data.get('article_id')
        if not article_id:
            return Response({'error': 'Article ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            article = Article.objects.get(id=article_id)
            # Create or get existing reading history entry
            history, created = ReadingHistory.objects.get_or_create(
                user=request.user,
                article=article
            )
            serializer = ReadingHistorySerializer(history)
            return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'Failed to record reading history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CommentLikeView(APIView):
    """
    View to like/unlike comments.
    """
    def post(self, request, comment_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            comment = Comment.objects.get(id=comment_id)
            
            # Periksa apakah user sudah menyukai komentar ini sebelumnya
            like, created = CommentLike.objects.get_or_create(
                user=request.user,
                comment=comment
            )
            
            if created:
                # Jika baru dibuat, tambahkan jumlah like
                comment.likes = comment.likes + 1
                comment.save()
                
                # Buat notifikasi untuk penulis komentar
                try:
                    # Coba dapatkan user yang membuat komentar berdasarkan email
                    comment_author = User.objects.get(email=comment.author_email)
                    if comment_author != request.user:  # Jangan buat notifikasi untuk diri sendiri
                        Notification.objects.create(
                            user=comment_author,
                            title='Your comment received a like',
                            message=f'{request.user.username} liked your comment on an article',
                            notification_type='comment_like',
                            related_comment=comment,
                            related_user=request.user
                        )
                except User.DoesNotExist:
                    # Jika penulis komentar tidak memiliki akun, tidak buat notifikasi
                    pass
                
                return Response({
                    'message': 'Comment liked',
                    'likes': comment.likes
                }, status=status.HTTP_200_OK)
            else:
                # Jika sudah pernah menyukai, kembalikan pesan bahwa sudah disukai
                return Response({
                    'message': 'Comment already liked',
                    'likes': comment.likes
                }, status=status.HTTP_200_OK)
                
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, comment_id):
        # Untuk unlike komentar
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            comment = Comment.objects.get(id=comment_id)
            
            # Cari apakah user telah menyukai komentar ini
            try:
                like = CommentLike.objects.get(user=request.user, comment=comment)
                like.delete()
                
                # Kurangi jumlah like
                if comment.likes > 0:
                    comment.likes = comment.likes - 1
                    comment.save()
                
                return Response({
                    'message': 'Comment unliked',
                    'likes': comment.likes
                }, status=status.HTTP_200_OK)
            except CommentLike.DoesNotExist:
                # Jika belum menyukai, kembalikan pesan error
                return Response({
                    'error': 'Comment was not liked'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)


class CommentReportView(APIView):
    """
    View to report inappropriate comments.
    """
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        comment_id = request.data.get('comment_id')
        reason = request.data.get('reason')
        description = request.data.get('description', '')
        
        if not comment_id or not reason:
            return Response({'error': 'Comment ID and reason are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comment = Comment.objects.get(id=comment_id)
            # Cek apakah user sudah melaporkan komentar ini sebelumnya
            report, created = CommentReport.objects.get_or_create(
                comment=comment,
                user=request.user,
                defaults={
                    'reason': reason,
                    'description': description
                }
            )
            
            if created:
                # Buat notifikasi ke admin tentang laporan baru
                admin_users = User.objects.filter(is_staff=True)
                for admin in admin_users:
                    Notification.objects.create(
                        user=admin,
                        title=f'New Comment Report',
                        message=f'A comment by {comment.author_name} has been reported for {reason}',
                        notification_type='system',
                        related_comment=comment,
                        related_user=request.user
                    )
                
                return Response({'message': 'Comment reported successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Comment already reported'}, status=status.HTTP_200_OK)
                
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'Failed to report comment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotificationView(APIView):
    """
    View to manage user notifications.
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]  # Ambil 20 notifikasi terbaru
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to fetch notifications'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        # Endpoint untuk menandai notifikasi sebagai sudah dibaca
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        notification_id = request.data.get('notification_id')
        if not notification_id:
            return Response({'error': 'Notification ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request):
        # Endpoint untuk menghapus notifikasi
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        notification_id = request.data.get('notification_id')
        if not notification_id:
            return Response({'error': 'Notification ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.delete()
            return Response({'message': 'Notification deleted'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

class UserPreferenceView(APIView):
    """
    View to manage user preferences.
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user_preference, created = UserPreference.objects.get_or_create(user=request.user)
            serializer = UserPreferenceSerializer(user_preference)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to fetch user preferences'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get or create user preferences
            user_preference, created = UserPreference.objects.get_or_create(user=request.user)
            
            # Update fields based on request data
            if 'preferred_categories_ids' in request.data:
                user_preference.preferred_categories.set(request.data['preferred_categories_ids'])
            
            if 'preferred_sources_ids' in request.data:
                user_preference.preferred_sources.set(request.data['preferred_sources_ids'])
                
            if 'newsletter_subscription' in request.data:
                user_preference.newsletter_subscription = request.data['newsletter_subscription']
            
            user_preference.save()
            serializer = UserPreferenceSerializer(user_preference)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to update user preferences'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(APIView):
    permission_classes = []  # Tidak ada izin yang diperlukan untuk registrasi
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email, and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': 'An error occurred during registration'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    permission_classes = []  # Tidak ada izin yang diperlukan untuk login
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user:
            # Login the user
            login(request, user)
            
            # Get or create token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    def post(self, request):
        try:
            # Get token from headers
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header:
                token_key = auth_header.split(' ')[1]  # Bearer <token>
                token = Token.objects.get(key=token_key)
                token.delete()
            
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            return Response({'error': 'Token not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An error occurred during logout'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'user_id': request.user.id,
                'username': request.user.username,
                'email': request.user.email
            })
        else:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
