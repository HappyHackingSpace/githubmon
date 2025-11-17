"use client";

import { useState } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Tag,
  User,
  GitFork,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { FavoriteCategory } from "@/stores/preferences";

export function FavoritesSettings() {
  const {
    pinnedRepos,
    favoriteUsers,
    categories,
    repoMetadata,
    userMetadata,
    togglePinnedRepo,
    toggleFavoriteUser,
    addCategory,
    updateCategory,
    deleteCategory,
    setRepoCategory,
    setUserCategory,
  } = usePreferencesStore();

  const [newRepoName, setNewRepoName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [editingCategory, setEditingCategory] = useState<FavoriteCategory | null>(null);
  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);

  const handleAddRepo = () => {
    if (newRepoName.trim() && newRepoName.includes("/")) {
      togglePinnedRepo(newRepoName.trim());
      setNewRepoName("");
      setAddRepoDialogOpen(false);
    }
  };

  const handleAddUser = () => {
    if (newUsername.trim()) {
      toggleFavoriteUser(newUsername.trim());
      setNewUsername("");
      setAddUserDialogOpen(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName("");
      setNewCategoryColor("#3b82f6");
      setAddCategoryDialogOpen(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      updateCategory(editingCategory.id, newCategoryName.trim(), newCategoryColor);
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryColor("#3b82f6");
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category || null;
  };

  const colorOptions = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Teal", value: "#14b8a6" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories
          </h3>
          <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a category to organize your favorites
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    placeholder="e.g., Work Projects"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategoryColor(color.value)}
                        className={`h-10 rounded border-2 transition-all ${
                          newCategoryColor === color.value
                            ? "border-gray-900 dark:border-gray-100 scale-110"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories yet. Create one to organize your favorites.
          </p>
        ) : (
          <div className="grid gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline">
                    {
                      [
                        ...Object.values(repoMetadata).filter(
                          (m) => m.categoryId === category.id
                        ),
                        ...Object.values(userMetadata).filter(
                          (m) => m.categoryId === category.id
                        ),
                      ].length
                    }{" "}
                    items
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingCategory(category);
                      setNewCategoryName(category.name);
                      setNewCategoryColor(category.color);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategoryColor(color.value)}
                        className={`h-10 rounded border-2 transition-all ${
                          newCategoryColor === color.value
                            ? "border-gray-900 dark:border-gray-100 scale-110"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleUpdateCategory} className="w-full">
                  Update Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Favorite Repositories ({pinnedRepos.length})
          </h3>
          <Dialog open={addRepoDialogOpen} onOpenChange={setAddRepoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Repository</DialogTitle>
                <DialogDescription>
                  Enter the full repository name (owner/repo)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="e.g., facebook/react"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRepo()}
                />
                <Button onClick={handleAddRepo} className="w-full">
                  Add Repository
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {pinnedRepos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No repositories added yet. Add one manually or from search results.
          </p>
        ) : (
          <div className="grid gap-2">
            {pinnedRepos.map((repo) => {
              const metadata = repoMetadata[repo];
              const category = metadata?.categoryId
                ? getCategoryName(metadata.categoryId)
                : null;

              return (
                <div
                  key={repo}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <GitFork className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{repo}</div>
                      {category && (
                        <Badge
                          variant="outline"
                          className="mt-1"
                          style={{
                            borderColor: category.color,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={metadata?.categoryId || ""}
                      onChange={(e) =>
                        setRepoCategory(repo, e.target.value || null)
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePinnedRepo(repo)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Favorite Users ({favoriteUsers.length})
          </h3>
          <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
                <DialogDescription>
                  Enter the GitHub username
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="e.g., torvalds"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                />
                <Button onClick={handleAddUser} className="w-full">
                  Add User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {favoriteUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No users added yet. Add one manually or from search results.
          </p>
        ) : (
          <div className="grid gap-2">
            {favoriteUsers.map((username) => {
              const metadata = userMetadata[username];
              const category = metadata?.categoryId
                ? getCategoryName(metadata.categoryId)
                : null;

              return (
                <div
                  key={username}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{username}</div>
                      {category && (
                        <Badge
                          variant="outline"
                          className="mt-1"
                          style={{
                            borderColor: category.color,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={metadata?.categoryId || ""}
                      onChange={(e) =>
                        setUserCategory(username, e.target.value || null)
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavoriteUser(username)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
