import React from 'react';
import { connect } from 'react-redux';
import { styled } from '@mui/material/styles';
import {
  loadStore,
  addToCart,
  removeFromCart,
  purchase
} from 'store/marketplace';
import { AppState } from 'store';
import { Upgrade, Spacecraft } from 'models';
import { Products, Cart } from 'components';
import { Grid } from '@mui/material';
// import CategoryFilter from './category-filter/category-filter.component';
import SpacecraftFilter from './spacecraft-filter/spacecraft-filter.component';
import StoreTypeFilter from './store-type-filter/store-type-filter.component';
import { filterObjArr } from 'utils/helpers';

const StyledGrid = styled(Grid)({
  position: 'relative'
});

const StickyGrid = styled(Grid)({
  height: '100%',
  position: 'sticky',
  top: 0
});

interface Props {
  products: (Spacecraft | Upgrade)[];
  cart: (Spacecraft | Upgrade)[];
  credits: number;
  loadStore: () => void;
  addToCart: (product: Spacecraft | Upgrade) => void;
  removeFromCart: (index: number) => void;
  purchase: (cart: (Spacecraft | Upgrade)[]) => void;
}

interface State {
  productTypeFilter: string[];
  spacecraftFilter: string[];
}

class Marketplace extends React.Component<Props, State> {
  state: State = {
    productTypeFilter: [],
    spacecraftFilter: []
  };

  componentDidMount() {
    this.props.loadStore();
  }

  handleAddToCart = (product: Spacecraft | Upgrade) => {
    this.props.addToCart(product);
  };

  handleRemoveFromCart = (index: number) => {
    this.props.removeFromCart(index);
  };

  handlePurchase = () => {
    this.props.purchase(this.props.cart);
  };

  handleCategoryFilter = (filters: string[]) => {
    console.log('category', filters);
  };

  handleSpacecraftFilter = (filters: string[]) => {
    this.setState({ spacecraftFilter: filters });
  };

  handleUpgradeFilter = (filters: string[]) => {
    this.setState({ productTypeFilter: filters });
  };

  public render() {
    const { products, cart, credits } = this.props;
    const { productTypeFilter, spacecraftFilter } = this.state;

    let filtered: (Spacecraft | Upgrade)[] = products;
    filtered = filterObjArr(products, spacecraftFilter, 'spacecraftRegistry');
    filtered = filterObjArr(filtered, productTypeFilter, 'storeType');

    return (
      <StyledGrid container spacing={6}>
        <StickyGrid size="grow">
          {/* <CategoryFilter onFilterClick={this.handleCategoryFilter} /> */}
          <SpacecraftFilter onFilterClick={this.handleSpacecraftFilter} />
          <StoreTypeFilter onFilterClick={this.handleUpgradeFilter} />
        </StickyGrid>
        <Grid size={8}>
          <Products onAddClick={this.handleAddToCart} products={filtered} />
        </Grid>
        <StickyGrid size="grow">
          <Cart
            credits={credits}
            cart={cart}
            onRemove={this.handleRemoveFromCart}
            onPurchase={this.handlePurchase}
          />
        </StickyGrid>
      </StyledGrid>
    );
  }
}

export const mapStateToProps = (state: AppState) => ({
  products: state.marketplace.products,
  cart: state.marketplace.cart,
  credits: state.user.credits
});

export const mapDispatchToProps = {
  loadStore,
  addToCart,
  removeFromCart,
  purchase
};

export default connect(mapStateToProps, mapDispatchToProps)(Marketplace);
