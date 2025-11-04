from django.urls import path
from .views import ArticleList, ArticleDetail, CategoryList, CategoryDetail, CategoryArticlesList, SourceList, AuthorList, AuthorDetail, AuthorArticlesList, CommentListCreate, SubscribeView

urlpatterns = [
    path('articles/', ArticleList.as_view(), name='article-list'),
    path('articles/<int:pk>/', ArticleDetail.as_view(), name='article-detail'),
    path('articles/<int:article_pk>/comments/', CommentListCreate.as_view(), name='comment-list-create'),
    path('categories/', CategoryList.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),
    path('categories/<int:pk>/articles/', CategoryArticlesList.as_view(), name='category-articles-list'),
    path('sources/', SourceList.as_view(), name='source-list'),
    path('authors/', AuthorList.as_view(), name='author-list'),
    path('authors/<int:pk>/', AuthorDetail.as_view(), name='author-detail'),
    path('authors/<int:pk>/articles/', AuthorArticlesList.as_view(), name='author-articles-list'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
]