class DocumentEpoch {
  final String id;
  final String label;
  final String contentSnapshot;
  final DateTime timestamp;

  DocumentEpoch({
    required this.id,
    required this.label,
    required this.contentSnapshot,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'label': label,
    'contentSnapshot': contentSnapshot,
    'timestamp': timestamp.toIso8601String(),
  };

  factory DocumentEpoch.fromJson(Map<String, dynamic> json) => DocumentEpoch(
    id: json['id'] as String,
    label: json['label'] as String,
    contentSnapshot: json['contentSnapshot'] as String,
    timestamp: DateTime.parse(json['timestamp'] as String),
  );
}

class DocumentModel {
  final String id;
  String title;
  String content;
  DateTime updatedAt;
  DateTime createdAt;
  List<String> tags;
  bool isFavorite;
  List<DocumentEpoch> epochs;

  DocumentModel({
    required this.id,
    required this.title,
    required this.content,
    required this.updatedAt,
    required this.createdAt,
    this.tags = const [],
    this.isFavorite = false,
    List<DocumentEpoch>? epochs,
  }) : epochs = epochs ?? [];

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'content': content,
    'updatedAt': updatedAt.toIso8601String(),
    'createdAt': createdAt.toIso8601String(),
    'tags': tags,
    'isFavorite': isFavorite,
    'epochs': epochs.map((e) => e.toJson()).toList(),
  };

  factory DocumentModel.fromJson(Map<String, dynamic> json) => DocumentModel(
    id: json['id'] as String,
    title: json['title'] as String,
    content: json['content'] as String,
    updatedAt: DateTime.parse(json['updatedAt'] as String),
    createdAt: DateTime.parse(json['createdAt'] as String),
    tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
    isFavorite: json['isFavorite'] as bool? ?? false,
    epochs: (json['epochs'] as List<dynamic>?)
        ?.map((e) => DocumentEpoch.fromJson(e as Map<String, dynamic>))
        .toList() ?? [],
  );

  DocumentModel copyWith({
    String? id,
    String? title,
    String? content,
    DateTime? updatedAt,
    DateTime? createdAt,
    List<String>? tags,
    bool? isFavorite,
    List<DocumentEpoch>? epochs,
  }) {
    return DocumentModel(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
      tags: tags ?? this.tags,
      isFavorite: isFavorite ?? this.isFavorite,
      epochs: epochs ?? this.epochs,
    );
  }
}
