import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

// --- Events ---
abstract class OcrEvent extends Equatable {
  const OcrEvent();
  @override
  List<Object?> get props => [];
}

class OcrImageProcessed extends OcrEvent {
  final String imagePath;
  const OcrImageProcessed(this.imagePath);
  @override
  List<Object?> get props => [imagePath];
}

class OcrResetRequested extends OcrEvent {}

// --- States ---
abstract class OcrState extends Equatable {
  const OcrState();
  @override
  List<Object?> get props => [];
}

class OcrInitial extends OcrState {}
class OcrLoading extends OcrState {}

class OcrSuccess extends OcrState {
  final String fullText;
  final List<String> words;
  const OcrSuccess({required this.fullText, required this.words});
  @override
  List<Object?> get props => [fullText, words];
}

class OcrFailure extends OcrState {
  final String message;
  const OcrFailure(this.message);
  @override
  List<Object?> get props => [message];
}

// --- Bloc ---
class OcrBloc extends Bloc<OcrEvent, OcrState> {
  final TextRecognizer _textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);

  OcrBloc() : super(OcrInitial()) {
    on<OcrImageProcessed>(_onOcrImageProcessed);
    on<OcrResetRequested>(_onOcrResetRequested);
  }

  Future<void> _onOcrImageProcessed(OcrImageProcessed event, Emitter<OcrState> emit) async {
    emit(OcrLoading());
    try {
      final inputImage = InputImage.fromFilePath(event.imagePath);
      final RecognizedText recognizedText = await _textRecognizer.processImage(inputImage);

      if (recognizedText.text.trim().isEmpty) {
        emit(const OcrFailure("Không nhận dạng được văn bản nào trong ảnh. Vui lòng thử lại."));
        return;
      }

      // Split text into list of clean words (remove punctuation)
      final List<String> rawWords = recognizedText.text
          .replaceAll('\n', ' ')
          .split(RegExp(r'\s+'));

      final List<String> cleanWords = rawWords
          .map((w) => w.replaceAll(RegExp(r'[^\w\s\-]'), ''))
          .where((w) => w.trim().isNotEmpty)
          .toList();

      emit(OcrSuccess(fullText: recognizedText.text, words: cleanWords));
    } catch (e) {
      emit(OcrFailure("Lỗi xử lý hình ảnh: $e"));
    }
  }

  void _onOcrResetRequested(OcrResetRequested event, Emitter<OcrState> emit) {
    emit(OcrInitial());
  }

  @override
  Future<void> close() {
    _textRecognizer.close();
    return super.close();
  }
}
