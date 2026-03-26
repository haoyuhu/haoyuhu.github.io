from __future__ import annotations

from typing import Annotated, Any

from pydantic import AfterValidator, BaseModel, ConfigDict, Field


def validate_localized_text(value: dict[str, str]) -> dict[str, str]:
    if not isinstance(value, dict):
        raise ValueError("Localized text must be an object.")
    missing = [key for key in ("zh-CN", "en") if not value.get(key)]
    if missing:
        raise ValueError(f"Missing localized values: {', '.join(missing)}")
    return value


def validate_localized_lines(value: dict[str, list[str]]) -> dict[str, list[str]]:
    if not isinstance(value, dict):
        raise ValueError("Localized lines must be an object.")
    missing = [key for key in ("zh-CN", "en") if not value.get(key)]
    if missing:
        raise ValueError(f"Missing localized line values: {', '.join(missing)}")
    return value


LocalizedText = Annotated[dict[str, str], AfterValidator(validate_localized_text)]
LocalizedLines = Annotated[dict[str, list[str]], AfterValidator(validate_localized_lines)]


class PortfolioBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class Link(PortfolioBaseModel):
    id: str
    label: LocalizedText
    url: str
    icon: str | None = None


class NavigationItem(PortfolioBaseModel):
    id: str
    label: LocalizedText
    fileLabel: str
    studioOnly: bool = False


class ThemeTokens(PortfolioBaseModel):
    accent: str
    background: str
    panel: str
    border: str
    text: str
    muted: str
    success: str
    warning: str


class SettingsPanel(PortfolioBaseModel):
    aiModelLabel: str
    version: str
    scripts: list[str]


class StatusBar(PortfolioBaseModel):
    branchLabel: str
    diagnosticsLabel: LocalizedText
    fileTypeLabel: str
    encodingLabel: str


class RuntimeSettings(PortfolioBaseModel):
    apiBaseUrl: str | None = None
    localStudioEnabled: bool = False
    publicSite: bool = True


class StudioConfig(PortfolioBaseModel):
    title: LocalizedText
    description: LocalizedText
    supportVoiceViaCli: bool = True


class HomeRecommendations(PortfolioBaseModel):
    latestProject: str = "auto"
    latestNote: str = "auto"
    latestArticle: str = "auto"
    currentRole: str = "auto"


class SiteConfig(PortfolioBaseModel):
    title: LocalizedText
    description: LocalizedText
    localeDefault: str = "zh-CN"
    ownerHandle: str
    navigation: list[NavigationItem]
    theme: ThemeTokens
    settingsPanel: SettingsPanel
    statusBar: StatusBar
    runtime: RuntimeSettings
    studio: StudioConfig
    homeRecommendations: HomeRecommendations = Field(default_factory=HomeRecommendations)
    uiCopy: dict[str, Any] = Field(default_factory=dict, alias="copy")


class ProfileStats(PortfolioBaseModel):
    publicRepos: int = 0
    followers: int = 0
    following: int = 0


class SystemIdentityItem(PortfolioBaseModel):
    label: LocalizedText
    value: LocalizedText
    detail: LocalizedText | None = None
    tags: list[str] = Field(default_factory=list)
    useTechStackAsTags: bool = False


class MetricItem(PortfolioBaseModel):
    name: str
    level: int = Field(ge=0, le=100)


class ToolTelemetryItem(PortfolioBaseModel):
    name: str
    level: int = Field(ge=0, le=100)
    usage: str
    rating: str
    summary: LocalizedText


class ProfileConfig(PortfolioBaseModel):
    name: str
    avatarUrl: str
    primaryUrl: str
    title: LocalizedText
    heroExtends: LocalizedText
    biography: LocalizedText
    location: LocalizedText
    email: str | None = None
    socialLinks: list[Link]
    stats: ProfileStats
    systemIdentity: list[SystemIdentityItem]
    techStack: list[MetricItem]
    aiTools: list[ToolTelemetryItem]
    careerStartYear: int


class SkillEntry(PortfolioBaseModel):
    name: str
    level: str


class SkillGroup(PortfolioBaseModel):
    id: str
    label: LocalizedText
    items: list[SkillEntry]


class ProjectDetail(PortfolioBaseModel):
    name: str
    description: LocalizedText
    tech: list[str]


class ExperienceEntry(PortfolioBaseModel):
    id: str
    company: str
    role: LocalizedText
    startDate: str
    endDate: str
    location: LocalizedText
    description: LocalizedLines
    projects: list[ProjectDetail]


class EducationEntry(PortfolioBaseModel):
    id: str
    school: str
    degree: LocalizedText
    field: LocalizedText
    startDate: str
    endDate: str


class ResumeConfig(PortfolioBaseModel):
    summary: LocalizedText
    experience: list[ExperienceEntry]
    education: list[EducationEntry]
    skillGroups: list[SkillGroup]


class GitHubProjectSettings(PortfolioBaseModel):
    username: str
    cacheFile: str
    profileCacheFile: str
    includeCachedRepos: bool = True
    includeContributionRepos: bool = True
    excludeRepos: list[str] = Field(default_factory=list)


class ProjectItem(PortfolioBaseModel):
    id: str
    name: str
    nameWithOwner: str
    repositoryOwner: str
    description: LocalizedText
    language: str
    stars: int = 0
    forks: int = 0
    watchers: int = 0
    url: str
    homepage: str | None = None
    topics: list[str] = Field(default_factory=list)
    featured: bool = False
    relationship: str = "owner"
    source: str = "github-sync"
    pushedAt: str | None = None
    updatedAt: str | None = None


class ProjectsConfig(PortfolioBaseModel):
    github: GitHubProjectSettings
    items: list[ProjectItem]


class MediaAttachment(PortfolioBaseModel):
    type: str
    url: str


class PostEntry(PortfolioBaseModel):
    id: str
    kind: str
    slug: str
    date: str
    title: LocalizedText
    summary: LocalizedText
    tags: list[str]
    body: LocalizedText
    media: MediaAttachment | None = None
    sourcePath: str


class AssistantTarget(PortfolioBaseModel):
    id: str
    label: LocalizedText


class AssistantConfig(PortfolioBaseModel):
    title: LocalizedText
    version: str
    persona: LocalizedText
    helpText: LocalizedText
    bootSequence: LocalizedLines
    targets: list[AssistantTarget]
    unavailableMessage: LocalizedText


class GeneratedMeta(PortfolioBaseModel):
    generatedAt: str
    source: str
    bundleVersion: str
    warnings: list[str] = Field(default_factory=list)


class PortfolioBundle(PortfolioBaseModel):
    site: SiteConfig
    profile: ProfileConfig
    resume: ResumeConfig
    projects: ProjectsConfig
    posts: list[PostEntry]
    assistant: AssistantConfig
    generated: GeneratedMeta
