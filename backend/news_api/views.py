from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from .models import Article, Category, Source, Subscriber, Author, Comment, Bookmark
from .serializers import ArticleSerializer, CategorySerializer, SourceSerializer, SubscriberSerializer, AuthorSerializer, CommentSerializer, BookmarkSerializer

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
        return Comment.objects.filter(article_id=article_id, is_approved=True)

    def perform_create(self, serializer):
        article_id = self.kwargs['article_pk']
        try:
            article = Article.objects.get(pk=article_id)
            serializer.save(article=article)
        except Article.DoesNotExist:
            raise serializers.ValidationError("Article does not exist")

class SubscribeView(APIView):
    def post(self, request, format=None):
        serializer = SubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookmarkListCreateView(generics.ListCreateAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = []  # Sementara tanpa permission untuk testing

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
    permission_classes = []  # Sementara tanpa permission untuk testing

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


class RegisterView(APIView):
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
