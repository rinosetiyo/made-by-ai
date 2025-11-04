from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Article, Category, Source, Subscriber, Author, Comment
from .serializers import ArticleSerializer, CategorySerializer, SourceSerializer, SubscriberSerializer, AuthorSerializer, CommentSerializer

class ArticleList(generics.ListAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

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
        return Article.objects.filter(category_id=category_id)

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
        return Article.objects.filter(author_detail_id=author_id)

class CommentListCreate(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        article_id = self.kwargs['article_pk']
        return Comment.objects.filter(article_id=article_id, is_approved=True)

    def perform_create(self, serializer):
        article_id = self.kwargs['article_pk']
        article = Article.objects.get(pk=article_id)
        serializer.save(article=article)

class SubscribeView(APIView):
    def post(self, request, format=None):
        serializer = SubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
