from django.db import migrations


def seed_medicines(apps, schema_editor):
    Disease = apps.get_model("diseases", "Disease")
    Medicine = apps.get_model("medicines", "Medicine")

    coccidiosis = Disease.objects.filter(name="Coccidiosis").first()
    salmonellosis = Disease.objects.filter(name="Salmonellosis").first()

    meds = []
    if coccidiosis:
        meds.append(
            Medicine(
                name="Amprolium",
                disease=coccidiosis,
                dosage_guidelines="5 mg/kg body weight",
                administration="Oral for 5 days",
                notes="Ensure clean water availability.",
            )
        )
    if salmonellosis:
        meds.append(
            Medicine(
                name="Enrofloxacin",
                disease=salmonellosis,
                dosage_guidelines="10 mg/kg body weight",
                administration="Oral for 3-5 days",
                notes="Observe withdrawal period before egg/livestock use.",
            )
        )
    if meds:
        Medicine.objects.bulk_create(meds)


def unseed_medicines(apps, schema_editor):
    Medicine = apps.get_model("medicines", "Medicine")
    Medicine.objects.filter(name__in=["Amprolium", "Enrofloxacin"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("medicines", "0001_initial"),
        ("diseases", "0002_seed_diseases"),
    ]

    operations = [migrations.RunPython(seed_medicines, reverse_code=unseed_medicines)]
