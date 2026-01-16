from django.contrib import admin
from .models import DailyRequests, Requests, ReportedMalicious, Tag, Article, ResourceCategory, Resource, \
    ArticlesCategory


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "article_count")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)

    def article_count(self, obj):
        return obj.articles.count()

    article_count.short_description = "Articles"


@admin.register(ArticlesCategory)
class ArticlesCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "article_count")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "id")

    def article_count(self, obj):
        return obj.articles.count()

    article_count.short_description = "Articles"


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "category", "difficulty", "published_date", "read_time", "tag_list")
    list_filter = ("status", "created_date", "published_date", "author", "tags", "category", "difficulty", "read_time")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    date_hierarchy = "published_date"
    ordering = ("-published_date", "-created_date")

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "slug", "author", "status", "category")
        }),
        ("Content", {
            "fields": ("excerpt", "description", "content", "featured_image")
        }),
        ("Metadata", {
            "fields": ("tags", "difficulty", "read_time")
        }),
        ("Dates", {
            "fields": ("published_date",),
            "classes": ("collapse",)
        }),
    )

    def tag_list(self, obj):
        return ", ".join([tag.name for tag in obj.tags.all()[:3]])

    tag_list.short_description = "Tags"

    def save_model(self, request, obj, form, change):
        # Auto-set author to current user if not set
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "resource_count")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "name")

    def resource_count(self, obj):
        return obj.resources.count()

    resource_count.short_description = "Resources"


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "pricing", "difficulty", "is_affiliate", "order", "date_added")
    list_filter = ("category", "pricing", "difficulty", "is_affiliate")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("related_articles",)
    ordering = ("category", "order", "title")

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "slug", "category", "description", "link")
        }),
        ("Classification", {
            "fields": ("pricing", "difficulty", "is_affiliate", "order")
        }),
        ("Related Content", {
            "fields": ("related_articles",),
            "classes": ("collapse",)
        }),
    )


@admin.register(DailyRequests)
class DailyRequestsAdmin(admin.ModelAdmin):
    list_display = ("date", "count")
    ordering = ("-date",)
    date_hierarchy = "date"


@admin.register(Requests)
class RequestsLogAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "label", "timestamp", "ports", "reported_malicious")
    search_fields = ("ip_address", "label")
    list_filter = ("label", "reported_malicious")
    # date_hierarchy = "timestamp"
    # ordering = ("-timestamp",)


@admin.register(ReportedMalicious)
class ReportedMaliciousAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "abuse_confidence_score", "country_code", "last_reported_at")
    search_fields = ("ip_address", "country_code")
    list_filter = ("abuse_confidence_score", "country_code")
    ordering = ("-abuse_confidence_score", "-last_reported_at")