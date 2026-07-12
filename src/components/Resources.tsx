import React, { useState, useEffect } from 'react';
import { StudentData, ResourceItem } from '../types';

interface ResourcesProps {
  studentData: StudentData;
  isTeacher?: boolean;
  onUpdate?: (updatedData: StudentData) => void;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  'PDF': '📄', 'Word': '📝', 'Audio': '🎧', 'Video': '🎥', 'Website': '🌐', 'Image': '🖼️', 'Other': '📁'
};

export const Resources: React.FC<ResourcesProps> = ({ studentData, isTeacher = false, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for teacher edit mode
  const [newTajweedRuleName, setNewTajweedRuleName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resCategory, setResCategory] = useState('');
  const [resFileType, setResFileType] = useState<'PDF' | 'Word' | 'Audio' | 'Video' | 'Website' | 'Image' | 'Other'>('PDF');

  // Inline editing states for teacher
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [tempSubtitle, setTempSubtitle] = useState('');

  const [editingRuleIdx, setEditingRuleIdx] = useState<number | null>(null);
  const [editingRuleName, setEditingRuleName] = useState('');

  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [editResTitle, setEditResTitle] = useState('');
  const [editResUrl, setEditResUrl] = useState('');
  const [editResDesc, setEditResDesc] = useState('');
  const [editResCategory, setEditResCategory] = useState('');
  const [editResFileType, setEditResFileType] = useState<'PDF' | 'Word' | 'Audio' | 'Video' | 'Website' | 'Image' | 'Other'>('PDF');

  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const categories = studentData.resourceCategories || [];

  // Sync category state selection when categories list loads
  useEffect(() => {
    if (categories.length > 0 && !resCategory) {
      setResCategory(categories[0]);
    }
  }, [categories, resCategory]);

  const filterResources = (resources: ResourceItem[]) => {
    if (!searchQuery.trim()) return resources;
    const query = searchQuery.toLowerCase().trim();
    return resources.filter(
      r =>
        r.title.toLowerCase().includes(query) ||
        (r.description || '').toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
    );
  };

  const filtered = filterResources(studentData.resources || []);

  const handleSaveSubtitle = () => {
    setEditingSubtitle(false);
    const updated = {
      ...studentData,
      tajweedSubtitle: tempSubtitle.trim()
    };
    onUpdate?.(updated);
  };

  const handleAddTajweedRule = () => {
    if (!newTajweedRuleName.trim()) return;
    const updated = {
      ...studentData,
      tajweedRules: [
        ...(studentData.tajweedRules || []),
        { name: newTajweedRuleName.trim(), learned: false }
      ]
    };
    onUpdate?.(updated);
    setNewTajweedRuleName('');
  };

  const handleSaveRuleName = (idx: number) => {
    if (!editingRuleName.trim()) {
      setEditingRuleIdx(null);
      return;
    }
    const rules = [...(studentData.tajweedRules || [])];
    if (rules[idx]) {
      rules[idx] = { ...rules[idx], name: editingRuleName.trim() };
      const updated = {
        ...studentData,
        tajweedRules: rules
      };
      onUpdate?.(updated);
    }
    setEditingRuleIdx(null);
  };

  const handleToggleRule = (idx: number) => {
    const rules = [...(studentData.tajweedRules || [])];
    if (rules[idx]) {
      rules[idx] = { ...rules[idx], learned: !rules[idx].learned };
      const updated = {
        ...studentData,
        tajweedRules: rules
      };
      onUpdate?.(updated);
    }
  };

  const handleDeleteRule = (idx: number) => {
    setConfirmDialog({
      title: 'Delete Tajweed Rule 🔤',
      message: 'Are you sure you want to delete this Tajweed rule?',
      onConfirm: () => {
        const rules = (studentData.tajweedRules || []).filter((_, i) => i !== idx);
        const updated = {
          ...studentData,
          tajweedRules: rules
        };
        onUpdate?.(updated);
      }
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const name = newCategoryName.trim();
    if ((studentData.resourceCategories || []).includes(name)) {
      alert("Category already exists.");
      return;
    }
    const updated = {
      ...studentData,
      resourceCategories: [...(studentData.resourceCategories || []), name]
    };
    onUpdate?.(updated);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    setConfirmDialog({
      title: 'Delete Category 📁',
      message: `Are you sure you want to delete the category "${cat}"? All resources inside will be moved to Uncategorized.`,
      onConfirm: () => {
        const nextCats = (studentData.resourceCategories || []).filter(c => c !== cat);
        // update resources that were in this category
        const nextResources = (studentData.resources || []).map(r => {
          if (r.category === cat) {
            return { ...r, category: 'Uncategorized' };
          }
          return r;
        });
        // add 'Uncategorized' to categories if it isn't there and we moved resources to it
        const hasUncategorized = nextResources.some(r => r.category === 'Uncategorized');
        const finalCats = hasUncategorized && !nextCats.includes('Uncategorized')
          ? [...nextCats, 'Uncategorized']
          : nextCats;

        const updated = {
          ...studentData,
          resourceCategories: finalCats,
          resources: nextResources
        };
        onUpdate?.(updated);
      }
    });
  };

  const handleAddResource = () => {
    if (!resTitle.trim() || !resUrl.trim()) {
      alert("Please enter title and link.");
      return;
    }
    const selectedCat = resCategory || categories[0] || 'Quran';
    const newRes: ResourceItem = {
      category: selectedCat,
      fileType: resFileType,
      title: resTitle.trim(),
      url: resUrl.trim(),
      description: resDesc.trim() || undefined,
      addedDate: new Date().toISOString().split('T')[0]
    };
    const updated = {
      ...studentData,
      resources: [...(studentData.resources || []), newRes]
    };
    onUpdate?.(updated);
    setResTitle('');
    setResUrl('');
    setResDesc('');
  };

  const handleDeleteResourceByItem = (resourceToDelete: ResourceItem) => {
    setConfirmDialog({
      title: 'Delete Resource 🗑️',
      message: `Are you sure you want to delete the resource "${resourceToDelete.title}"?`,
      onConfirm: () => {
        const updated = {
          ...studentData,
          resources: (studentData.resources || []).filter(
            r => !(r.title === resourceToDelete.title && r.url === resourceToDelete.url)
          )
        };
        onUpdate?.(updated);
      }
    });
  };

  const handleStartEditResource = (r: ResourceItem) => {
    setEditingResource(r);
    setEditResTitle(r.title);
    setEditResUrl(r.url);
    setEditResDesc(r.description || '');
    setEditResCategory(r.category);
    setEditResFileType(r.fileType);
  };

  const handleSaveResource = () => {
    if (!editingResource) return;
    if (!editResTitle.trim() || !editResUrl.trim()) {
      alert("Please enter title and link.");
      return;
    }
    const updatedResources = (studentData.resources || []).map(r => {
      if (r.title === editingResource.title && r.url === editingResource.url) {
        return {
          ...r,
          title: editResTitle.trim(),
          url: editResUrl.trim(),
          description: editResDesc.trim() || undefined,
          category: editResCategory,
          fileType: editResFileType
        };
      }
      return r;
    });

    const updated = {
      ...studentData,
      resources: updatedResources
    };
    onUpdate?.(updated);
    setEditingResource(null);
  };

  return (
    <>
      <div className="space-y-6">
      {/* 🔤 Tajweed Rules Learned (Merged) */}
      <div id="tajweed-rules-card" className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">Tajweed Rules Learned</h2>
            {isTeacher ? (
              <div className="flex items-center gap-1.5 group/sub">
                {editingSubtitle ? (
                  <input
                    type="text"
                    value={tempSubtitle}
                    onChange={(e) => setTempSubtitle(e.target.value)}
                    onBlur={handleSaveSubtitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveSubtitle();
                      if (e.key === 'Escape') setEditingSubtitle(false);
                    }}
                    autoFocus
                    className="p-1 text-xs border rounded bg-cream dark:bg-[#1c2b22] border-sage dark:border-[#4a6552] text-sage-deep dark:text-white w-80 max-w-full focus:outline-none"
                  />
                ) : (
                  <p
                    onClick={() => {
                      setEditingSubtitle(true);
                      setTempSubtitle(studentData.tajweedSubtitle || "Review the tajweed principles unlocked during your studies.");
                    }}
                    className="text-xs text-muted dark:text-[#C7D2C4] cursor-pointer hover:bg-cream/40 dark:hover:bg-[#2f4a3a] px-1 rounded transition-colors flex items-center gap-1"
                    title="Click to customize this description"
                  >
                    <span>{studentData.tajweedSubtitle || "Review the tajweed principles unlocked during your studies."}</span>
                    <span className="text-[10px] opacity-65 hover:opacity-100">✏️</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted dark:text-[#C7D2C4]">
                {studentData.tajweedSubtitle || "Review the tajweed principles unlocked during your studies."}
              </p>
            )}
          </div>
          {isTeacher && (
            <div className="flex gap-2 text-xs" id="teacher-tajweed-rule-add-container">
              <input
                id="teacher-new-tajweed-rule-input"
                type="text"
                placeholder="e.g. Qalqalah Rule"
                value={newTajweedRuleName}
                onChange={(e) => setNewTajweedRuleName(e.target.value)}
                className="p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-xs w-44"
              />
              <button
                id="teacher-add-tajweed-rule-btn"
                onClick={handleAddTajweedRule}
                className="px-4 bg-sage hover:bg-sage-dark text-white rounded font-bold text-xs cursor-pointer"
              >
                Add Rule
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(studentData.tajweedRules || []).length === 0 ? (
            <p className="text-xs text-muted py-2">No tajweed rules added yet.</p>
          ) : (
            (studentData.tajweedRules || []).map((rule, idx) => (
              <span
                key={idx}
                id={`tajweed-rule-${idx}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  rule.learned
                    ? 'bg-soft-bg3 dark:bg-[#335140] text-sage-dark dark:text-emerald-200'
                    : 'bg-soft-bg2 dark:bg-[#3d2e24] text-danger/80 dark:text-amber-200'
                }`}
              >
                <button
                  id={`tajweed-rule-toggle-btn-${idx}`}
                  onClick={() => isTeacher && handleToggleRule(idx)}
                  title={isTeacher ? "Click to toggle learned status" : undefined}
                  className={isTeacher ? "hover:scale-110 active:scale-95 transition-transform cursor-pointer font-bold" : "cursor-default"}
                >
                  {rule.learned ? '✅' : '⏳'}
                </button>
                {editingRuleIdx === idx ? (
                  <input
                    type="text"
                    value={editingRuleName}
                    onChange={(e) => setEditingRuleName(e.target.value)}
                    onBlur={() => handleSaveRuleName(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRuleName(idx);
                      if (e.key === 'Escape') setEditingRuleIdx(null);
                    }}
                    autoFocus
                    className="p-0.5 text-xs border rounded bg-cream dark:bg-[#1c2b22] border-sage dark:border-[#4a6552] text-sage-deep dark:text-white w-24 focus:outline-none"
                  />
                ) : (
                  <span
                    className={`ml-1 ${isTeacher ? 'cursor-pointer hover:underline' : ''}`}
                    onClick={() => {
                      if (isTeacher) {
                        setEditingRuleIdx(idx);
                        setEditingRuleName(rule.name);
                      }
                    }}
                    title={isTeacher ? "Click to rename this Tajweed rule" : undefined}
                  >
                    {rule.name}
                  </span>
                )}
                {isTeacher && editingRuleIdx !== idx && (
                  <button
                    onClick={() => {
                      setEditingRuleIdx(idx);
                      setEditingRuleName(rule.name);
                    }}
                    className="text-[10px] opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                    title="Rename rule"
                  >
                    ✏️
                  </button>
                )}
                {isTeacher && (
                  <button
                    id={`tajweed-rule-delete-btn-${idx}`}
                    onClick={() => handleDeleteRule(idx)}
                    className="ml-1.5 text-danger font-bold hover:scale-125 transition-transform cursor-pointer text-xs"
                    title="Delete Tajweed Rule"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* 📁 Student Resource Library */}
      <div id="resource-library-card" className="space-y-6 bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">📁 Student Resource Library</h2>
            <p className="text-xs text-muted dark:text-[#C7D2C4]">Shared learning sheets, maps, audios, and worksheets.</p>
          </div>
          <input
            id="resource-search-input"
            type="text"
            placeholder="Search resources by title, description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552] text-sage-deep dark:text-white text-sm w-full md:max-w-xs"
          />
        </div>

        {/* Teacher Category Management & Resource Upload form */}
        {isTeacher && (
          <div id="teacher-resource-management-container" className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-soft-bg dark:bg-[#2f4a3a] rounded-xl border border-border-soft dark:border-[#4a6552]">
            {/* Category Form */}
            <div id="teacher-category-form-container" className="space-y-3">
              <h3 className="font-serif text-sm font-bold text-sage-dark dark:text-white">📁 Manage Library Categories</h3>
              <div className="flex gap-2 text-xs">
                <input
                  id="teacher-new-category-input"
                  type="text"
                  placeholder="e.g. Worksheets"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                />
                <button
                  id="teacher-add-category-btn"
                  onClick={handleAddCategory}
                  className="px-4 bg-sage hover:bg-sage-dark text-white rounded font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map(cat => (
                  <span
                    key={cat}
                    id={`teacher-cat-tag-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-1 bg-white dark:bg-[#24392c] border border-border-soft dark:border-[#4a6552] px-2 py-0.5 rounded text-xs"
                  >
                    {cat}
                    <button
                      id={`teacher-cat-delete-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-danger font-bold hover:scale-110 ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Resource Upload Form */}
            <div id="teacher-resource-upload-form" className="space-y-2.5">
              <h3 className="font-serif text-sm font-bold text-sage-dark dark:text-white">📂 Upload Shared Resource</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-sage uppercase mb-1">Category</label>
                  <select
                    id="teacher-resource-category-select"
                    value={resCategory || (categories.length > 0 ? categories[0] : '')}
                    onChange={(e) => setResCategory(e.target.value)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-sage uppercase mb-1">FileType</label>
                  <select
                    id="teacher-resource-filetype-select"
                    value={resFileType}
                    onChange={(e) => setResFileType(e.target.value as any)}
                    className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] border-border-soft dark:border-[#4a6552]"
                  >
                    <option value="PDF">📄 PDF</option>
                    <option value="Word">📝 Word</option>
                    <option value="Audio">🎧 Audio</option>
                    <option value="Video">🎥 Video</option>
                    <option value="Website">🌐 Website</option>
                    <option value="Image">🖼️ Image</option>
                    <option value="Other">📁 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  id="teacher-resource-title-input"
                  type="text"
                  placeholder="Resource Title (e.g. Tajweed Chart)"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] text-xs border-border-soft dark:border-[#4a6552]"
                />
              </div>

              <div>
                <input
                  id="teacher-resource-url-input"
                  type="text"
                  placeholder="Download/Access Link (https://...)"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] text-xs border-border-soft dark:border-[#4a6552]"
                />
              </div>

              <div>
                <input
                  id="teacher-resource-desc-input"
                  type="text"
                  placeholder="Short Description (Optional)"
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full p-2 border rounded-md bg-cream dark:bg-[#1c2b22] text-xs border-border-soft dark:border-[#4a6552]"
                />
              </div>

              <button
                id="teacher-upload-resource-btn"
                onClick={handleAddResource}
                className="w-full py-1.5 bg-sage hover:bg-sage-dark text-white rounded-md font-bold text-xs transition-all cursor-pointer"
              >
                Upload Resource File
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-muted dark:text-[#C7D2C4] py-8">No resources match your search.</p>
          ) : (
            categories.map(cat => {
              const items = filtered.filter(r => r.category === cat);
              if (items.length === 0) return null;

              return (
                <details key={cat} id={`resource-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`} className="group border border-border-soft dark:border-[#4a6552] rounded-xl overflow-hidden" open>
                  <summary className="flex items-center justify-between p-3 bg-soft-bg dark:bg-[#2f4a3a] cursor-pointer select-none font-semibold text-sm text-sage-dark dark:text-white hover:opacity-95">
                    <span className="flex items-center gap-2">
                      📁 {cat}
                      <span className="text-xs text-muted dark:text-[#C7D2C4] font-normal">({items.length} items)</span>
                    </span>
                    <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-[#24392c]">
                    {items.map((r, idx) => {
                      const icon = FILE_TYPE_ICONS[r.fileType] || '📁';
                      const isEditing = editingResource && editingResource.title === r.title && editingResource.url === r.url;

                      if (isEditing) {
                        return (
                          <div
                            key={idx}
                            id={`resource-item-edit-${idx}`}
                            className="flex flex-col border-2 border-sage rounded-xl overflow-hidden shadow-sm p-3 bg-cream dark:bg-[#1c2b22] space-y-2.5"
                          >
                            <div className="flex justify-between items-center border-b border-border-soft dark:border-[#4a6552] pb-1.5">
                              <span className="text-[11px] font-bold text-sage uppercase">✏️ Edit Resource</span>
                              <button
                                onClick={() => setEditingResource(null)}
                                className="text-muted dark:text-[#C7D2C4] hover:text-danger font-bold text-xs"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <label className="block text-[9px] font-bold text-sage uppercase mb-0.5">Title</label>
                                <input
                                  type="text"
                                  value={editResTitle}
                                  onChange={(e) => setEditResTitle(e.target.value)}
                                  className="w-full p-1 border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552]"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-sage uppercase mb-0.5">Link / URL</label>
                                <input
                                  type="text"
                                  value={editResUrl}
                                  onChange={(e) => setEditResUrl(e.target.value)}
                                  className="w-full p-1 border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552]"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-sage uppercase mb-0.5">Description</label>
                                <textarea
                                  value={editResDesc}
                                  onChange={(e) => setEditResDesc(e.target.value)}
                                  rows={2}
                                  className="w-full p-1 border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <label className="block text-[9px] font-bold text-sage uppercase mb-0.5">Category</label>
                                  <select
                                    value={editResCategory}
                                    onChange={(e) => setEditResCategory(e.target.value)}
                                    className="w-full p-1 border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552]"
                                  >
                                    {categories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-sage uppercase mb-0.5">FileType</label>
                                  <select
                                    value={editResFileType}
                                    onChange={(e) => setEditResFileType(e.target.value as any)}
                                    className="w-full p-1 border rounded bg-white dark:bg-[#24392c] border-border-soft dark:border-[#4a6552]"
                                  >
                                    <option value="PDF">📄 PDF</option>
                                    <option value="Word">📝 Word</option>
                                    <option value="Audio">🎧 Audio</option>
                                    <option value="Video">🎥 Video</option>
                                    <option value="Website">🌐 Website</option>
                                    <option value="Image">🖼️ Image</option>
                                    <option value="Other">📁 Other</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={handleSaveResource}
                                  className="flex-1 py-1.5 bg-sage hover:bg-sage-dark text-white rounded font-bold text-xs cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingResource(null)}
                                  className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-800 text-sage-deep dark:text-white rounded font-bold text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          id={`resource-item-${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          className="flex flex-col border border-border-soft dark:border-[#4a6552] rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] transition-all bg-cream dark:bg-[#1c2b22]"
                        >
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex flex-col h-full"
                          >
                            <div className="h-16 bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center text-2xl text-white">
                              {icon}
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-sage-deep dark:text-white line-clamp-1">
                                  {r.title}
                                </h4>
                                {r.description && (
                                  <p className="text-[11px] text-muted dark:text-[#C7D2C4] line-clamp-2 mt-1">
                                    {r.description}
                                  </p>
                                )}
                              </div>
                              <span className="inline-block self-start text-[9px] font-bold uppercase tracking-wider bg-soft-bg3 dark:bg-[#335140] text-sage-dark dark:text-emerald-200 px-2 py-0.5 rounded-full mt-2">
                                {r.fileType}
                              </span>
                            </div>
                          </a>

                          {isTeacher && (
                            <div className="px-3 pb-3 flex gap-2">
                              <button
                                onClick={() => handleStartEditResource(r)}
                                className="flex-1 py-1 bg-sage/10 hover:bg-sage/20 text-sage dark:text-[#E8ECE7] border border-sage/20 text-[10px] font-bold rounded transition-colors cursor-pointer"
                              >
                                Edit ✏️
                              </button>
                              <button
                                id={`teacher-delete-resource-btn-${idx}`}
                                onClick={() => handleDeleteResourceByItem(r)}
                                className="flex-1 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-danger text-[10px] font-bold rounded border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                              >
                                Delete ✕
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })
          )}
        </div>
      </div>
    </div>

    {confirmDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-[#24392c] rounded-2xl p-6 max-w-sm w-full border border-border-soft dark:border-[#4a6552] shadow-xl space-y-4 text-center">
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-bold text-sage-dark dark:text-white">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-muted dark:text-[#C7D2C4] leading-relaxed">
              {confirmDialog.message}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmDialog(null)}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-sage-deep dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(null);
              }}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
