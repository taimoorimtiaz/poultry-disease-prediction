from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("analysis", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="analysisresult",
            name="age_weeks",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="analysisresult",
            name="flock_size",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
