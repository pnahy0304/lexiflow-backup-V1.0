allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Inject namespace for older Android packages that don't specify it (e.g. google_mlkit_commons)
subprojects {
    afterEvaluate {
        val androidExt = project.extensions.findByType<com.android.build.gradle.BaseExtension>()
        androidExt?.let {
            if (it.namespace == null) {
                it.namespace = project.group.toString().replace("-", "_")
            }
        }
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
