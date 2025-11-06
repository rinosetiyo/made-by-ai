from django.urls import path
from .views import ArticleList, ArticleDetail, CategoryList, CategoryDetail, CategoryArticlesList, SourceList, AuthorList, AuthorDetail, AuthorArticlesList, CommentListCreate, SubscribeView, BookmarkListCreateView, BookmarkDeleteView, UserBookmarksView, ArticleBookmarksView, RelatedArticlesView, MultiSearchView, RegisterView, LoginView, LogoutView, CurrentUserView

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
    path('bookmarks/', BookmarkListCreateView.as_view(), name='bookmark-list-create'),
    path('bookmarks/<int:pk>/', BookmarkDeleteView.as_view(), name='bookmark-delete'),
    path('users/<int:user_id>/bookmarks/', UserBookmarksView.as_view(), name='user-bookmarks'),
    path('articles/<int:article_id>/bookmarks/', ArticleBookmarksView.as_view(), name='article-bookmarks'),
    path('articles/<int:article_id>/related/', RelatedArticlesView.as_view(), name='related-articles'),
    path('multi-search/', MultiSearchView.as_view(), name='multi-search'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/user/', CurrentUserView.as_view(), name='current-user'),
]