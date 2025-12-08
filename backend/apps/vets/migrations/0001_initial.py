from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="VetClinic",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("address", models.TextField()),
                ("lat", models.FloatField()),
                ("lng", models.FloatField()),
                ("phone", models.CharField(blank=True, max_length=50, null=True)),
            ],
        ),
    ]
