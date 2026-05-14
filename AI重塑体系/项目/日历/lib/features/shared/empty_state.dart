import 'package:flutter/cupertino.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.message,
  });

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        message,
        style: const TextStyle(
          color: CupertinoColors.systemGrey,
          fontSize: 17,
        ),
      ),
    );
  }
}
