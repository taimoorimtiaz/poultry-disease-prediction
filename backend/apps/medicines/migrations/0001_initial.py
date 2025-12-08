from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("diseases", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Medicine",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("dosage_guidelines", models.TextField()),
                ("administration", models.TextField()),
                ("notes", models.TextField(blank=True, null=True)),
                (
                    "disease",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="medicines", to="diseases.disease"),
                ),
            ],
        ),
    ]
