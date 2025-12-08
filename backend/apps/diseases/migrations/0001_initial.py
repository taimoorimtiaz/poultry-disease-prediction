from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Disease",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("symptoms", models.TextField()),
            ],
        ),
        migrations.AddField(
            model_name="disease",
            name="images",
            field=models.ManyToManyField(blank=True, to="analysis.sampleimage"),
        ),
    ]
