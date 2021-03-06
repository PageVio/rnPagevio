import React, { Component } from "react";
import PropTypes from "prop-types";
import { ViewPropTypes, StyleSheet, Dimensions, Animated } from "react-native";
// Metrics constansts
const CARD_WIDTH = 250;
export default class HorizontalCarousel extends Component {
    constructor(props) {
        super(props);
        this.listComponent = null;
        this.updateWidth = ({ window }) => {
            this.setState({ width: window.width });
        };
        this.renderItem = (info) => {
            const { index } = info;
            const centerOffset = this.offsetForItem(index);
            const startOffset = centerOffset - CARD_WIDTH / 2;
            const endOffset = centerOffset + CARD_WIDTH / 2;
            return (
            <Animated.View style={[
                styles.card,
                {
                    transform: [
                        {
                            scale: this.state.scrollAnimation.interpolate({
                                inputRange: [startOffset, centerOffset, endOffset],
                                outputRange: [0.9, 1.0, 0.9],
                                extrapolate: "clamp"
                            })
                        }
                    ]
                }
            ]}>
            {this.props.renderItem(info)}
         </Animated.View>);
        };
        const { width } = Dimensions.get("window");
        this.state = { width, scrollAnimation: new Animated.Value(0) };
        this.state.scrollAnimation.setValue(this.offsetForItem(0));
        Dimensions.addEventListener("change", this.updateWidth);
    }
    componentWillUnmount() {
        Dimensions.removeEventListener("change", this.updateWidth);
    }
    componentDidMount() {
        this.scrollToItem(0, false);
    }
    contentInset() {
        const horizontalInset = (this.state.width - CARD_WIDTH) / 2;
        return { top: 0, right: horizontalInset, bottom: 0, left: horizontalInset };
    }
    scrollToItem(index, animated = true) {
        this.scrollToOffset(this.offsetForItem(index), animated);
    }
    scrollToOffset(offset, animated = true) {
        if (this.listComponent == null)
            return;
            this.listComponent.scrollToOffset({
                offset,
                animated
            });
    }
    offsetForItem(index) {
        return CARD_WIDTH * index - this.contentInset().left;
    }
    render() {
        const { data, keyExtractor, style } = this.props;
        return (<Animated.FlatList ref={(ref) => (this.listComponent = ref && ref.getNode())} style={style} contentInset={this.contentInset()} showsHorizontalScrollIndicator={false} data={data} renderItem={this.renderItem} keyExtractor={keyExtractor} horizontal snapToAlignment="center" snapToInterval={CARD_WIDTH} onScroll={Animated.event([
            {
                nativeEvent: {
                    contentOffset: {
                        x: this.state.scrollAnimation
                    }
                }
            }
        ], { useNativeDriver: true })}/>);
    }
}
HorizontalCarousel.propTypes = {
    data: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func.isRequired,
    style: ViewPropTypes.style
};
const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        marginTop: 10,
        marginBottom: 16,
        backgroundColor: "transparent",
        shadowColor: "black",
        borderRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6
    }
});