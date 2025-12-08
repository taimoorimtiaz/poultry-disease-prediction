from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SampleImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="uploads/%Y/%m/%d/")),
                ("thumbnail", models.ImageField(blank=True, null=True, upload_to="uploads/thumbs/%Y/%m/%d/")),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="AnalysisResult",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("predicted_diseases", models.JSONField()),
                ("medicines_recommended", models.JSONField()),
                ("processed_at", models.DateTimeField(auto_now_add=True)),
                ("sample", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to="analysis.sampleimage")),
            ],
        ),
    ]
