module.exports = {
  NavigationContainer: ({ children }) => children,
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  }),
  useFocusEffect: (cb) => cb(),
};
