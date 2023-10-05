import { Separator } from "@/components/ui/separator"
import { FeaturesForm } from "./features-form"

export default function SettingsFeaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Features</h3>
        <p className="text-sm text-muted-foreground">
          Turn user to your side by providing extra features.
        </p>
      </div>
      <Separator />
      <FeaturesForm/>
    </div>
  )
}