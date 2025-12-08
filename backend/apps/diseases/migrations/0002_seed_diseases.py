from django.db import migrations


def seed_diseases(apps, schema_editor):
    Disease = apps.get_model("diseases", "Disease")
    Disease.objects.bulk_create(
        [
            Disease(
                name="Coccidiosis",
                description="Parasitic disease affecting the intestinal tract of poultry.",
                symptoms="Bloody droppings, ruffled feathers, weight loss, lethargy.",
            ),
            Disease(
                name="Salmonellosis",
                description="Bacterial infection caused by Salmonella spp.",
                symptoms="Diarrhea, dehydration, reduced appetite, drop in egg production.",
            ),
        ]
    )


def unseed_diseases(apps, schema_editor):
    Disease = apps.get_model("diseases", "Disease")
    Disease.objects.filter(name__in=["Coccidiosis", "Salmonellosis"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("diseases", "0001_initial"),
    ]

    operations = [migrations.RunPython(seed_diseases, reverse_code=unseed_diseases)]
